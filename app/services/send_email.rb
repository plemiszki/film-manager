class SendEmail

  def initialize(sender:, recipients:, subject:, body:, cc: [], attachments: [], email_type: 'statement', metadata: {})
    @sender = sender
    @subject = subject
    @body = body
    @attachments = Array(attachments)
    @email_type = email_type
    @metadata = metadata

    if test_mode?
      @recipients = [ENV['TEST_MODE_EMAIL']]
      @cc = []
    else
      @recipients = parse_recipients(recipients)
      @cc = parse_recipients(cc)
    end
  end

  def call
    mg_client = Mailgun::Client.new(ENV['MAILGUN_KEY'])
    mb = Mailgun::MessageBuilder.new
    mb.from(@sender.email)
    @recipients.each { |addr| mb.add_recipient(:to, addr) }
    @cc.each { |addr| mb.add_recipient(:cc, addr) }
    mb.subject(@subject)
    mb.body_text(@body)
    @attachments.each { |attachment| mb.add_attachment(attachment) }

    response = mg_client.send_message('filmmovement.com', mb)
    response_body = response.body.is_a?(String) ? JSON.parse(response.body) : response.body
    mailgun_message_id = response_body['id']

    (@recipients + @cc).map do |recipient|
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

  private

  def test_mode?
    ENV['TEST_MODE'] == 'true'
  end

  def parse_recipients(value)
    return [] if value.blank?

    if value.is_a?(String)
      value.split(";").map(&:strip).reject(&:blank?)
    else
      Array(value)
    end
  end
end
