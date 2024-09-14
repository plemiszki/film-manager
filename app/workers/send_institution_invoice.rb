class SendInstitutionInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    invoice = Invoice.find(args['invoice_id'])
    institution = invoice.institution
    current_user = User.find(args['user_id'])
    settings = Setting.first
    errors = []

    subject = "Your Film Movement Invoice"
    text = "#{settings.institution_order_invoice_email_text.strip}\n\n"
    text += "Kind Regards,\n\n#{current_user.email_signature}"

    # send invoice
    is_test_mode = ENV['TEST_MODE'] == 'true'

    if institution.use_stripe
      invoice.create_in_stripe!
      invoice.email_through_stripe!
      Setting.first.update!(next_institution_invoice_number: settings.next_institution_invoice_number + 1)
      job.update!({ status: :success, first_line: "Invoice Sent Successfully", metadata: { showSuccessMessageModal: true } })
    else
      invoice.export!(pathname)
      attachments = [File.open("#{pathname}/Invoice #{invoice.number}.pdf", "r"), File.open(Rails.root.join('app', 'workers', 'Film Movement W9.pdf'), "r")]
      message_params = {
        from: current_user.email,
        to: (is_test_mode ? ENV['TEST_MODE_EMAIL'] : args['email']),
        cc: (is_test_mode ? nil : current_user.email),
        subject: subject,
        text: text,
        attachment: attachments,
      }

      begin
        mg_client.send_message 'filmmovement.com', message_params
        Setting.first.update!(next_institution_invoice_number: settings.next_institution_invoice_number + 1)
      rescue
        errors << "Unable to send invoice to #{args['email']}"
      end

      if errors.present?
        invoice.destroy
        job.update!({ status: :failed, first_line: "Failed to Send Invoice", errors_text: errors.join("\n") })
      else
        job.update!({ status: :success, first_line: "Invoice Sent Successfully", metadata: { showSuccessMessageModal: true } })
      end
    end
  end
end
