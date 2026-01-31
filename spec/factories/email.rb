FactoryBot.define do

  factory :email do
    email_type { 'statement' }
    recipient { 'recipient@example.com' }
    subject { 'Your Q1 2025 producer reports from Film Movement' }
    status { :pending }
    mailgun_message_id { "#{SecureRandom.hex(16)}@filmmovement.com" }
    sent_at { Time.current }
    association :sender, factory: :user
  end

end
