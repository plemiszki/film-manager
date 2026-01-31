sender = User.find_or_create_by!(email: 'michael@example.com') do |user|
  user.name = 'Michael Rosenberg'
  user.password = 'password123'
end

emails_data = [
  { status: :delivered, sent_at: '2025-01-15 10:30:00' },
  { status: :delivered, sent_at: '2025-01-15 10:31:00' },
  { status: :pending,   sent_at: '2025-01-15 10:32:00' },
  { status: :failed,    sent_at: '2025-01-15 10:33:00' },
  { status: :bounced,   sent_at: '2025-01-15 10:34:00' }
]

emails_data.each_with_index do |data, index|
  Email.find_or_create_by!(mailgun_message_id: "seed-msg-#{index + 1}") do |email|
    email.email_type = 'statement'
    email.recipient = 'recipient@example.com'
    email.subject = 'Your Statement'
    email.sender = sender
    email.status = data[:status]
    email.sent_at = data[:sent_at]
  end
end

puts "Created #{Email.count} emails"
