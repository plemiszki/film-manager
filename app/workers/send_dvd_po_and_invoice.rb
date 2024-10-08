class SendDvdPoAndInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(id, current_user_id, reporting_only)
    purchase_order = PurchaseOrder.find(id)
    current_user = User.find(current_user_id)
    dvd_customer = DvdCustomer.find_by_id(purchase_order.customer_id)
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    # send invoice
    if purchase_order.send_invoice
      purchase_order.create_and_send_invoice!(sender: current_user)
    end

    # send shipping files
    source_doc = nil
    unless reporting_only
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
    end

    purchase_order.update({ ship_date: Date.today, source_doc: source_doc, reporting_only: reporting_only })
  end
end
