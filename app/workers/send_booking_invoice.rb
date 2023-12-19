class SendBookingInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    invoice = Invoice.find(args['invoice_id'])
    current_user = User.find(args['user_id'])
    settings = Setting.first

    if invoice.total_minus_payments <= 0
      payment_status = 'paid'
    elsif invoice.invoice_payments.count > 0
      payment_status = 'partial'
    else
      payment_status = 'unpaid'
    end

    if payment_status == 'paid'
      subject = "Your paid invoice/receipt from Film Movement is attached"
      text = "#{settings.paid_booking_invoice_email_text.strip}\n\n"
    elsif payment_status == 'partial'
      subject = "Your Film Movement invoice - outstanding balance"
      text = "#{settings.partially_paid_booking_invoice_email_text.strip}\n\n"
    else
      subject = "Your Film Movement Invoice"
      if args['overage'] == 'true'
        text = "#{settings.unpaid_overage_booking_invoice_email_text.strip}\n\n"
      else
        text = "#{settings.unpaid_non_overage_booking_invoice_email_text.strip}\n\n"
      end
    end

    unless payment_status == 'paid'
      text += "#{settings.booking_invoice_payment_info_email_text.strip}\n\n"
      text += "#{settings.shipping_terms_email_text.strip}\n\n" if args['shipping_terms']
    end

    text += "#{settings.all_booking_invoices_email_text.strip}\n\nKind Regards,\n\n#{current_user.email_signature}"

    # send invoice
    is_test_mode = ENV['TEST_MODE'] == 'true'
    invoice.export!(pathname)
    attachments = [File.open("#{pathname}/Invoice #{invoice.number}.pdf", "r"), File.open(Rails.root.join('app', 'workers', 'Film Movement W9.pdf'), "r")]
    message_params = {
      from: current_user.email,
      to: (is_test_mode ? ENV['TEST_MODE_EMAIL'] : args['email']),
      cc: (is_test_mode ? nil : current_user.email),
      subject: subject,
      text: text,
      attachment: attachments
    }
    mg_client.send_message 'filmmovement.com', message_params

    # update next booking invoice number
    settings = Setting.first
    settings.update(next_booking_invoice_number: settings.next_booking_invoice_number + 1)

    job.update!({ status: 'success', first_line: '', metadata: {} })
  end
end
