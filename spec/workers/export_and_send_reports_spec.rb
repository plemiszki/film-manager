require 'rails_helper'

RSpec.describe ExportAndSendReports do
  let(:time_started) { Time.now.to_i.to_s }
  let(:quarter) { 1 }
  let(:year) { 2025 }

  let!(:label) { create(:label) }
  let!(:revenue_stream) { create(:revenue_stream, name: 'Video') }
  let!(:licensor) { create(:licensor, email: 'licensor@example.com') }
  let!(:sender) { create(:user, email: 'michael@filmmovement.com', name: 'Michael Rosenberg') }
  let!(:film) do
    create(:no_expenses_recouped_film,
      licensor: licensor,
      export_reports: true,
      send_reports: true
    )
  end
  let!(:royalty_report) do
    create(:royalty_report,
      film: film,
      quarter: quarter,
      year: year,
      date_sent: nil
    )
  end
  let!(:job) { create(:job, job_id: time_started, status: :running) }

  let(:report_ids) { [royalty_report.id] }
  let(:mailgun_client) { instance_double(Mailgun::Client) }
  let(:mailgun_response) { double('response', body: { 'id' => '<test-message-id@filmmovement.com>' }) }
  let(:report_filename) { "#{film.title} - Q#{quarter} #{year}.pdf" }

  before do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('TEST_MODE').and_return(nil)
    allow(ENV).to receive(:[]).with('MAILGUN_KEY').and_return('test-key')
    allow(Mailgun::Client).to receive(:new).and_return(mailgun_client)
    allow(mailgun_client).to receive(:send_message).and_return(mailgun_response)
    allow_any_instance_of(RoyaltyReport).to receive(:export) do |report, args|
      # Create the actual file in the licensor directory
      directory = args[:directory]
      filepath = File.join(directory, report_filename)
      FileUtils.touch(filepath)
      report_filename
    end
  end

  after do
    FileUtils.rm_rf("#{Rails.root}/tmp/#{time_started}")
  end

  describe '#perform' do
    it 'creates the temporary directory' do
      described_class.new.perform(report_ids, quarter, year, time_started)
      expect(Dir.exist?("#{Rails.root}/tmp/#{time_started}")).to be true
    end

    it 'exports reports for films with licensors' do
      described_class.new.perform(report_ids, quarter, year, time_started)
      licensor_folder = "#{Rails.root}/tmp/#{time_started}/#{licensor.id}"
      expect(Dir.exist?(licensor_folder)).to be true
      expect(Dir.entries(licensor_folder)).to include(report_filename)
    end

    it 'sends email via Mailgun' do
      expect(mailgun_client).to receive(:send_message).with('filmmovement.com', anything)
      described_class.new.perform(report_ids, quarter, year, time_started)
    end

    it 'creates an Email record after sending' do
      expect {
        described_class.new.perform(report_ids, quarter, year, time_started)
      }.to change(Email, :count).by(1)
    end

    it 'creates Email with correct attributes' do
      described_class.new.perform(report_ids, quarter, year, time_started)

      email = Email.last
      expect(email.email_type).to eq('statement')
      expect(email.recipient).to eq('licensor@example.com')
      expect(email.subject).to eq("Your Q#{quarter} #{year} producer reports from Film Movement")
      expect(email.mailgun_message_id).to eq('<test-message-id@filmmovement.com>')
      expect(email.sender).to eq(sender)
      expect(email.status).to eq('pending')
    end

    it 'creates Email with correct metadata' do
      described_class.new.perform(report_ids, quarter, year, time_started)

      email = Email.last
      expect(email.metadata['licensor_id']).to eq(licensor.id)
      expect(email.metadata['quarter']).to eq(quarter)
      expect(email.metadata['year']).to eq(year)
      expect(email.metadata['report_ids']).to include(royalty_report.id)
    end

    it 'updates report date_sent' do
      described_class.new.perform(report_ids, quarter, year, time_started)
      expect(royalty_report.reload.date_sent).to eq(Date.today)
    end

    it 'updates job status to success when no errors' do
      described_class.new.perform(report_ids, quarter, year, time_started)
      expect(job.reload.status).to eq('success')
      expect(job.first_line).to eq('Done!')
    end

    context 'when film has no licensor' do
      before { film.update!(licensor: nil) }

      it 'adds error to job' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        expect(job.reload.errors_text).to include("Film #{film.title} is missing licensor")
      end
    end

    context 'when licensor has no email' do
      before { licensor.update!(email: '') }

      it 'adds error to job' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        expect(job.reload.errors_text).to include("Licensor #{licensor.name} is missing email")
      end

      it 'does not create an Email record' do
        expect {
          described_class.new.perform(report_ids, quarter, year, time_started)
        }.not_to change(Email, :count)
      end
    end

    context 'when Mailgun fails' do
      before do
        allow(mailgun_client).to receive(:send_message).and_raise(StandardError.new('Mailgun error'))
      end

      it 'adds error to job' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        expect(job.reload.errors_text).to include("Failed to send email to #{licensor.name}")
      end

      it 'does not create an Email record' do
        expect {
          described_class.new.perform(report_ids, quarter, year, time_started)
        }.not_to change(Email, :count)
      end

      it 'sets job status to failed' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        expect(job.reload.status).to eq('failed')
      end
    end

    context 'when job is killed' do
      before { job.update!(status: :killed) }

      it 'stops processing early' do
        expect_any_instance_of(RoyaltyReport).not_to receive(:export)
        described_class.new.perform(report_ids, quarter, year, time_started)
      end
    end

    context 'when report_ids is empty' do
      let(:report_ids) { [] }

      it 'completes successfully with no reports to process' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        expect(job.reload.status).to eq('success')
      end

      it 'does not create any Email records' do
        expect {
          described_class.new.perform(report_ids, quarter, year, time_started)
        }.not_to change(Email, :count)
      end
    end

    context 'in test mode' do
      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('TEST_MODE').and_return('true')
        allow(ENV).to receive(:[]).with('TEST_MODE_EMAIL').and_return('test@example.com')
        allow(ENV).to receive(:[]).with('MAILGUN_KEY').and_return('test-key')
      end

      it 'sends to test email address' do
        described_class.new.perform(report_ids, quarter, year, time_started)
        email = Email.last
        expect(email.recipient).to eq('test@example.com')
      end
    end
  end
end
