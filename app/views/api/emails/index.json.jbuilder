json.emails @emails do |email|
  json.id email.id
  json.emailType email.email_type.titleize
  json.sentAt email.sent_at&.strftime('%Y-%m-%d %H:%M:%S')
  json.sentBy email.sender&.name
  json.status email.status
end
