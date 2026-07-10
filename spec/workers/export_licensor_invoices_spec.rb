require 'rails_helper'
require 'roo'

RSpec.describe ExportLicensorInvoices do
  let(:time_started) { Time.now.to_i.to_s }
  let(:quarter) { 1 }
  let(:year) { 2025 }
  let(:file_path) { "#{Rails.root}/tmp/#{time_started}/#{described_class::FILENAME}" }
  let(:gl_account_col) { described_class::COLUMN_HEADERS.index('G/L Account') + 1 }

  let!(:label) { create(:label) }
  let!(:theatrical_stream) { create(:revenue_stream, name: 'Theatrical') }
  let!(:fm_sub_stream) { create(:revenue_stream, name: 'FM Subscription') }
  let!(:licensor) { create(:licensor) }
  let!(:film) { create(:no_expenses_recouped_film, licensor: licensor) }
  let!(:report) { create(:royalty_report, film: film, quarter: quarter, year: year, joined_amount_due: 100) }
  let!(:job) { create(:job, job_id: time_started, status: :running) }

  before do
    allow_any_instance_of(ExportAndUploadSpreadsheet).to receive(:upload_to_aws).and_return('https://example.com/file.xlsx')
  end

  after do
    FileUtils.rm_rf("#{Rails.root}/tmp/#{time_started}")
  end

  def gl_account_in_output
    xlsx = Roo::Spreadsheet.open(file_path)
    xlsx.sheet(0).cell(2, gl_account_col)
  end

  def output_rows
    xlsx = Roo::Spreadsheet.open(file_path)
    sheet = xlsx.sheet(0)
    (2..sheet.last_row).map do |row_num|
      described_class::COLUMN_HEADERS.each_with_index.each_with_object({}) do |(header, index), hash|
        hash[header] = sheet.cell(row_num, index + 1)
      end
    end
  end

  describe 'G/L Account column' do
    it 'uses 49000 for a film with all zero revenue percentages' do
      described_class.new.perform(quarter, year, 'all', time_started)
      expect(gl_account_in_output).to eq('49000')
    end

    it 'uses 49000 for a film with multiple non-zero revenue streams' do
      film.film_revenue_percentages.update_all(value: 50)
      described_class.new.perform(quarter, year, 'all', time_started)
      expect(gl_account_in_output).to eq('49000')
    end

    it 'uses 49350 for a film with only FM Subscription non-zero' do
      film.film_revenue_percentages.find_by(revenue_stream_id: fm_sub_stream.id).update!(value: 50)
      described_class.new.perform(quarter, year, 'all', time_started)
      expect(gl_account_in_output).to eq('49350')
    end
  end

  describe 'crossed films' do
    let!(:crossed_licensor) { create(:licensor, name: 'Crossed Films Licensor', sage_id: 'CROSSED-VENDOR') }

    def build_report(title:, revenue:)
      film = create(:no_expenses_recouped_film, title: title, licensor: crossed_licensor)
      film.film_revenue_percentages.update_all(value: 50)
      report = create(:no_expenses_recouped_royalty_report, film_id: film.id, quarter: quarter, year: year, mg: 0, e_and_o: 0)
      report.create_empty_streams!
      report.royalty_revenue_streams.each { |stream| stream.update!(current_revenue: revenue) }
      report.calculate!
      [film, report]
    end

    it 'nets crossed films into a single invoice line for the combined amount due' do
      # Each film alone: current_licensor_share = 100 * 0.5 * 2 streams = $100 due
      # Crossed together: 200 * 0.5 * 2 streams = $200 due, not 2x $100 separately
      farinelli, _farinelli_report = build_report(title: 'Farinelli', revenue: 100)
      marquise, _marquise_report = build_report(title: 'Marquise', revenue: 100)
      CrossedFilm.create!(film_id: farinelli.id, crossed_film_id: marquise.id)
      CrossedFilm.create!(film_id: marquise.id, crossed_film_id: farinelli.id)

      described_class.new.perform(quarter, year, 'all', time_started)

      crossed_rows = output_rows.select { |row| row['Vendor ID'] == 'CROSSED-VENDOR' }
      expect(crossed_rows.length).to eq(1)
      expect(crossed_rows.first['Description']).to eq('Farinelli / Marquise')
      expect(crossed_rows.first['Amount'].to_f).to eq(200.0)
    end

    it 'excludes the crossed group when the combined amount due is negative, even if one film is individually positive' do
      shall_we_dance, _report = build_report(title: 'Shall We Dance', revenue: 1000)
      sumo_do, sumo_do_report = build_report(title: 'Sumo Do', revenue: 0)
      sumo_do_report.update!(e_and_o: 10000)
      sumo_do_report.calculate!
      CrossedFilm.create!(film_id: shall_we_dance.id, crossed_film_id: sumo_do.id)
      CrossedFilm.create!(film_id: sumo_do.id, crossed_film_id: shall_we_dance.id)

      described_class.new.perform(quarter, year, 'all', time_started)

      crossed_rows = output_rows.select { |row| row['Vendor ID'] == 'CROSSED-VENDOR' }
      expect(crossed_rows).to be_empty
    end
  end
end
