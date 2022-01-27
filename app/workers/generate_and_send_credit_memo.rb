class GenerateAndSendCreditMemo
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, return_id, current_user_id)

    job = Job.find_by_job_id(time_started)

    # Generate
    dvd_return = Return.find(return_id)
    credit_memo = dvd_return.generate_credit_memo!

    # Export
    job.update!({ first_line: 'Exporting Credit Memo' })
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")
    filename = "Credit Memo #{credit_memo.number}.pdf"
    path = "#{job_folder}/#{filename}"
    credit_memo.export(path)

    # Send
    job.update!({ first_line: 'Sending Credit Memo' })
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    current_user = User.find(current_user_id)
    email_text = "#{Setting.first.credit_memo_email_text}\n\nKind Regards,\n\n#{current_user.email_signature}"
    dvd_customer = credit_memo.customer
    recipient_email_address = (ENV['TEST_MODE'] == 'true' ? ENV['TEST_MODE_EMAIL'] : (dvd_customer.credit_memo_email.presence || dvd_customer.invoices_email))
    message_params = {
      from: current_user.email,
      to: recipient_email_address,
      cc: current_user.email,
      subject: 'Your Film Movement Credit Memo',
      text: email_text,
      attachment: [File.open(path, "r")]
    }
    mg_client.send_message 'filmmovement.com', message_params
    job.update!({
      status: :success,
      first_line: 'Credit Memo Sent Successfully',
      metadata: {
        credit_memo_id: credit_memo.id,
        credit_memo_date: credit_memo.sent_date,
        credit_memo_number: credit_memo.number,
        show_success_message_modal: true,
      }
    })

  rescue => error

    credit_memo.try(:destroy)
    job.update!({ status: :failed, first_line: 'Failed to Send Credit Memo' })

  end

end
