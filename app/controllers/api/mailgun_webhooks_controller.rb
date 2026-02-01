class Api::MailgunWebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :verify_webhook_signature

  def create
    event_data = params['event-data'] || params
    event_type = event_data['event']
    message_id = extract_message_id(event_data)

    email = Email.find_by(mailgun_message_id: message_id)

    if email.nil?
      render json: { status: 'ok', message: 'Email not found' }, status: :ok
      return
    end

    case event_type
    when 'delivered'
      timestamp = extract_timestamp(event_data)
      email.mark_delivered!(timestamp)
    when 'failed'
      error_message = extract_error_message(event_data)
      if event_data.dig('severity') == 'permanent'
        email.mark_failed!(error_message)
      end
    when 'bounced'
      error_message = extract_error_message(event_data)
      email.mark_bounced!(error_message)
    end

    render json: { status: 'ok' }, status: :ok
  end

  private

  def verify_webhook_signature
    return true if Rails.env.test?

    signing_key = ENV['MAILGUN_KEY']
    return true if signing_key.blank?

    signature_data = params['signature'] || {}
    timestamp = signature_data['timestamp']
    token = signature_data['token']
    signature = signature_data['signature']

    return head :unauthorized if timestamp.blank? || token.blank? || signature.blank?

    digest = OpenSSL::Digest::SHA256.new
    data = "#{timestamp}#{token}"
    expected_signature = OpenSSL::HMAC.hexdigest(digest, signing_key, data)

    unless ActiveSupport::SecurityUtils.secure_compare(expected_signature, signature)
      head :unauthorized
    end
  end

  def extract_message_id(event_data)
    message_id = event_data.dig('message', 'headers', 'message-id')
    message_id ||= event_data['Message-Id']
    message_id ||= event_data['message-id']
    message_id = "<#{message_id}>" if message_id && !message_id.start_with?('<')
    message_id
  end

  def extract_timestamp(event_data)
    timestamp = event_data['timestamp']
    timestamp ? Time.at(timestamp.to_f) : Time.current
  end

  def extract_error_message(event_data)
    delivery_status = event_data['delivery-status'] || {}
    delivery_status['message'] || delivery_status['description'] || 'Unknown error'
  end
end
