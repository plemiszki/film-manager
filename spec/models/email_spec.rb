require 'rails_helper'

RSpec.describe Email do

  describe 'validations' do
    it 'is valid with valid attributes' do
      email = build(:email)
      expect(email).to be_valid
    end

    it 'requires email_type' do
      email = build(:email, email_type: nil)
      expect(email).not_to be_valid
      expect(email.errors[:email_type]).to include("can't be blank")
    end

    it 'requires email_type to be in EMAIL_TYPES' do
      email = build(:email, email_type: 'invalid')
      expect(email).not_to be_valid
      expect(email.errors[:email_type]).to include('is not included in the list')
    end

    it 'requires recipient' do
      email = build(:email, recipient: nil)
      expect(email).not_to be_valid
      expect(email.errors[:recipient]).to include("can't be blank")
    end

    it 'requires subject' do
      email = build(:email, subject: nil)
      expect(email).not_to be_valid
      expect(email.errors[:subject]).to include("can't be blank")
    end

    it 'requires mailgun_message_id' do
      email = build(:email, mailgun_message_id: nil)
      expect(email).not_to be_valid
      expect(email.errors[:mailgun_message_id]).to include("can't be blank")
    end

    it 'requires unique mailgun_message_id' do
      create(:email, mailgun_message_id: 'abc123@filmmovement.com')
      email = build(:email, mailgun_message_id: 'abc123@filmmovement.com')
      expect(email).not_to be_valid
      expect(email.errors[:mailgun_message_id]).to include('has already been taken')
    end
  end

  describe 'associations' do
    it 'belongs to sender' do
      email = create(:email)
      expect(email.sender).to be_a(User)
    end
  end

  describe 'scopes' do
    it '.statements returns only statement emails' do
      statement = create(:email, email_type: 'statement')
      expect(Email.statements).to include(statement)
    end

    it '.recent orders by sent_at desc' do
      older = create(:email, sent_at: 1.day.ago)
      newer = create(:email, sent_at: Time.current, sender: create(:user, email: 'other@filmmovement.com'))
      expect(Email.recent.first).to eq(newer)
      expect(Email.recent.last).to eq(older)
    end
  end

  describe '#mark_delivered!' do
    it 'updates status to delivered and sets delivered_at' do
      email = create(:email, status: :pending)
      email.mark_delivered!
      expect(email.status).to eq('delivered')
      expect(email.delivered_at).to be_within(1.second).of(Time.current)
    end

    it 'accepts a custom timestamp' do
      email = create(:email, status: :pending)
      timestamp = 1.hour.ago
      email.mark_delivered!(timestamp)
      expect(email.delivered_at).to eq(timestamp)
    end
  end

  describe '#mark_failed!' do
    it 'updates status to failed and sets error_message' do
      email = create(:email, status: :pending)
      email.mark_failed!('550 User not found')
      expect(email.status).to eq('failed')
      expect(email.error_message).to eq('550 User not found')
    end
  end

  describe '#mark_bounced!' do
    it 'updates status to bounced and sets error_message' do
      email = create(:email, status: :pending)
      email.mark_bounced!('Mailbox full')
      expect(email.status).to eq('bounced')
      expect(email.error_message).to eq('Mailbox full')
    end
  end

end
