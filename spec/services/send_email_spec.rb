require 'rails_helper'

RSpec.describe SendEmail do
  let(:sender) { create(:user, email: 'sender@filmmovement.com') }
  let(:mailgun_client) { instance_double(Mailgun::Client) }

  before do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('TEST_MODE').and_return(nil)
    allow(ENV).to receive(:[]).with('MAILGUN_KEY').and_return('test-key')
    allow(Mailgun::Client).to receive(:new).and_return(mailgun_client)
    allow(mailgun_client).to receive(:send_message) do
      double('response', body: { 'id' => "<#{SecureRandom.uuid}@filmmovement.com>" })
    end
  end

  describe '#initialize' do
    describe 'recipients parsing' do
      it 'accepts a single email string' do
        service = described_class.new(
          sender: sender,
          recipients: 'bob@example.com',
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(1)
        expect(Email.last.recipient).to eq('bob@example.com')
      end

      it 'parses semicolon-separated email string' do
        service = described_class.new(
          sender: sender,
          recipients: 'bob@example.com;alice@example.com',
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(2)
        expect(Email.pluck(:recipient)).to match_array(['bob@example.com', 'alice@example.com'])
      end

      it 'trims whitespace from semicolon-separated emails' do
        service = described_class.new(
          sender: sender,
          recipients: 'bob@example.com; alice@example.com ; charlie@example.com',
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(3)
        expect(Email.pluck(:recipient)).to match_array(['bob@example.com', 'alice@example.com', 'charlie@example.com'])
      end

      it 'filters out blank entries from semicolon-separated string' do
        service = described_class.new(
          sender: sender,
          recipients: 'bob@example.com; ; alice@example.com;',
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(2)
        expect(Email.pluck(:recipient)).to match_array(['bob@example.com', 'alice@example.com'])
      end

      it 'accepts an array of emails' do
        service = described_class.new(
          sender: sender,
          recipients: ['bob@example.com', 'alice@example.com'],
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(2)
      end

      it 'handles blank recipients' do
        service = described_class.new(
          sender: sender,
          recipients: '',
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(0)
      end

      it 'handles nil recipients' do
        service = described_class.new(
          sender: sender,
          recipients: nil,
          subject: 'Test',
          body: 'Test body'
        )
        service.call
        expect(Email.count).to eq(0)
      end
    end

    describe 'cc parsing' do
      it 'parses semicolon-separated cc string' do
        service = described_class.new(
          sender: sender,
          recipients: 'main@example.com',
          cc: 'cc1@example.com; cc2@example.com',
          subject: 'Test',
          body: 'Test body'
        )

        expect(mailgun_client).to receive(:send_message) do |domain, message_builder|
          expect(message_builder.message[:cc]).to match_array(['cc1@example.com', 'cc2@example.com'])
          double('response', body: { 'id' => "<#{SecureRandom.uuid}@filmmovement.com>" })
        end

        service.call
      end

      it 'accepts an array of cc addresses' do
        service = described_class.new(
          sender: sender,
          recipients: 'main@example.com',
          cc: ['cc1@example.com', 'cc2@example.com'],
          subject: 'Test',
          body: 'Test body'
        )

        expect(mailgun_client).to receive(:send_message) do |domain, message_builder|
          expect(message_builder.message[:cc]).to match_array(['cc1@example.com', 'cc2@example.com'])
          double('response', body: { 'id' => "<#{SecureRandom.uuid}@filmmovement.com>" })
        end

        service.call
      end
    end
  end
end
