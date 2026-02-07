json.emails @emails do |email|
  json.id email.id
  json.description email.description
  json.sentBy email.sender&.name
  json.sentTo email.recipient
  json.sentAt email.sent_at&.strftime('%Y-%m-%d %H:%M:%S')
  json.status email.status
end
json.licensorEmailAddresses @licensor_email_addresses
json.quarters @quarters
