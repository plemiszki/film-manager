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
    is_test_mode = ENV['TEST_MODE'] == 'true'
    job.update!({ first_line: 'Sending Credit Memo' })
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    current_user = User.find(current_user_id)
    email_text = "#{Setting.first.credit_memo_email_text}\n\nKind Regards,\n\n#{current_user.email_signature}"
    dvd_customer = credit_memo.customer
    recipient_email_address = (is_test_mode ? ENV['TEST_MODE_EMAIL'] : (dvd_customer.credit_memo_email.presence || dvd_customer.invoices_email))
    cc_email_address = is_test_mode ? nil : current_user.email
    mb = Mailgun::MessageBuilder.new
    mb.from(current_user.email)
    mb.add_recipient(:to, recipient_email_address)
    mb.add_recipient(:cc, cc_email_address) if cc_email_address
    mb.subject('Your Film Movement Credit Memo')
    mb.body_text(email_text)
    mb.add_attachment(path)
    mg_client.send_message 'filmmovement.com', mb
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
