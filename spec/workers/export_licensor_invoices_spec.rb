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
    allow_any_instance_of(described_class).to receive(:upload_to_aws).and_return('https://example.com/file.xlsx')
  end

  after do
    FileUtils.rm_rf("#{Rails.root}/tmp/#{time_started}")
  end

  def gl_account_in_output
    xlsx = Roo::Spreadsheet.open(file_path)
    xlsx.sheet(0).cell(2, gl_account_col)
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
end
