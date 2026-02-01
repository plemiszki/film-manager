class SendEmail

  def initialize(sender:, recipients:, subject:, body:, cc: [], attachments: [], email_type: 'statement', metadata: {})
    @sender = sender
    @recipients = Array(recipients)
    @cc = Array(cc)
    @subject = subject
    @body = body
    @attachments = Array(attachments)
    @email_type = email_type
    @metadata = metadata
  end

  def call
    mg_client = Mailgun::Client.new(ENV['MAILGUN_KEY'])

    @recipients.map do |recipient|
      mb = Mailgun::MessageBuilder.new
      mb.from(@sender.email)
      mb.add_recipient(:to, recipient)
      @cc.each { |cc_address| mb.add_recipient(:cc, cc_address) }
      mb.subject(@subject)
      mb.body_text(@body)
      @attachments.each { |attachment| mb.add_attachment(attachment) }

      response = mg_client.send_message('filmmovement.com', mb)
      response_body = response.body.is_a?(String) ? JSON.parse(response.body) : response.body
      mailgun_message_id = response_body['id']

      Email.create!(
        email_type: @email_type,
        recipient: recipient,
        subject: @subject,
        mailgun_message_id: mailgun_message_id,
        sender: @sender,
        status: :pending,
        sent_at: Time.current,
        metadata: @metadata
      )
    end
  end
end
