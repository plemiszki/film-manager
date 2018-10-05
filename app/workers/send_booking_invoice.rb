class SendBookingInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(invoice_id, current_user_id, email, advance, overage, shipping_terms)
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    invoice = Invoice.find(invoice_id)
    current_user = User.find(current_user_id)

    if invoice.total_minus_payments <= 0
      payment_status = 'paid'
    elsif invoice.invoice_payments.count > 0
      payment_status = 'partial'
    else
      payment_status = 'unpaid'
    end

    if payment_status == 'paid'
      subject = "Your paid invoice/receipt from Film Movement is attached"
      text = "Hello,\n\nYour Film Movement invoice has been paid. Please find a receipt attached for your records. Thank you.\n\n"
    elsif payment_status == 'partial'
      subject = "Your Film Movement invoice - outstanding balance"
      text = "Hello,\n\nThank you for your payment. There is a balance remaining on your account. Please see your payment receipt and outstanding balance attached.\n\n"
    else
      subject = "Your Film Movement Invoice"
      if overage == 'true'
        text = "Hello,\n\nWe hope your screening was successful. A percentage of the box office is due to Film Movement as per the previously arranged terms. The attached invoice includes the new amount due, and indicates any guarantees which may have been billed on a previous invoice.\n\n"
      else
        text = "Hello,\n\nPlease find your invoice attached, in PDF format.\n\n"
      end
    end

    unless payment_status == 'paid'
      text += "The payment terms and remittance address are included in the document. We accept payments by check, wire, or credit card; to send a wire or credit card information, please contact #{current_user.name} at #{current_user.email}. All figures are in USD.\n\n"
      text += "Please note that exhibition materials will be sent approximately two weeks before your screening date, assuming this invoice has been paid. Exhibition materials will not be sent ahead of payment.\n\n" if shipping_terms
    end

    text += "Thank you for your business.\n\nKind Regards,\n\n#{current_user.email_signature}"

    # send invoice
    invoice.export!(pathname)
    attachments = [File.open("#{pathname}/Invoice #{invoice.number}.pdf", "r"), File.open(Rails.root.join('app', 'workers', 'Film Movement W9.pdf'), "r")]
    message_params = {
      from: current_user.email,
      to: email,
      cc: current_user.email,
      subject: subject,
      text: text,
      attachment: attachments
    }
    mg_client.send_message 'filmmovement.com', message_params
  end
end
