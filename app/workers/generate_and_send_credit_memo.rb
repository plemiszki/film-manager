class GenerateAndSendCreditMemo
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, return_id, current_user_id)

    job = Job.find_by_job_id(time_started)

    fail

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
    recipient_email_address = (ENV['CREDIT_MEMO_TEST_MODE'] == 'true' ? 'plemiszki@gmail.com' : credit_memo.customer.invoices_email)
    message_params = {
      from: current_user.email,
      to: recipient_email_address,
      cc: current_user.email,
      subject: 'Your Film Movement Credit Memo',
      text: email_text,
      attachment: [File.open(path, "r")]
    }
    mg_client.send_message 'filmmovement.com', message_params
    job.update!({ done: true, current_value: credit_memo.id })

  rescue => error

    p error
    credit_memo.try(:destroy)
    job.update!({ done: true, metadata: { message: 'Failed to Send Credit Memo' }})

  end

end
