class SendDvdPoAndInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(_, args)
    job = Job.find_by_job_id(args['time_started'])
    purchase_order = PurchaseOrder.find(args["purchase_order_id"])
    current_user = User.find(args["user_id"])
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    sent_invoice = false
    sent_shipping_files = false

    # send invoice
    if purchase_order.send_invoice
      job.update!({ first_line: "Sending Invoice" })
      purchase_order.create_and_send_invoice!(sender: current_user)
      sent_invoice = true
    end

    # send shipping files
    source_doc = nil
    unless args["reporting_only"]
      job.update!({ first_line: "Sending Shipping Files" })
      source_doc = 5533 + PurchaseOrder.find_by_sql("SELECT * FROM purchase_orders WHERE ship_date IS NOT NULL AND reporting_only != 't'").count
      purchase_order.create_shipping_files(pathname, source_doc)
      attachments = [File.open("#{pathname}/#{source_doc}_worderline.txt", "r"), File.open("#{pathname}/#{source_doc}_worder.txt", "r")]
      message_params = {
        from: current_user.email,
        to: (ENV['TEST_MODE'] == 'true' ? ENV['TEST_MODE_EMAIL'] : 'fulfillment@theadsgroup.com'),
        cc: current_user.email,
        subject: "Film Movement Sales Order #{source_doc}",
        text: "Please see attached shipping files.",
        attachment: attachments
      }
      mg_client.send_message 'filmmovement.com', message_params unless Rails.env.test?
      purchase_order.decrement_stock!
      sent_shipping_files = true
    end

    if sent_invoice && sent_shipping_files
      success_message = "Invoice and Shipping Files Sent Successfully"
    elsif sent_invoice
      success_message = "Invoice Sent Successfully"
    elsif sent_shipping_files
      success_message = "Shipping Files Sent Successfully"
    end

    purchase_order.update({ ship_date: Date.today, source_doc: source_doc, reporting_only: args["reporting_only"] })
    job.update!({ status: :success, first_line: success_message, metadata: { showSuccessMessageModal: true } })
  end
end
