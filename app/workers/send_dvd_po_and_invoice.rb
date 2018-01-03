class SendDvdPoAndInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(id, current_user_id, reporting_only)
    purchase_order = PurchaseOrder.find(id)
    current_user = User.find(current_user_id)
    dvd_customer = DvdCustomer.find(purchase_order.customer_id)
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']

    # send invoice
    if purchase_order.send_invoice
      number = Invoice.where(invoice_type: 'dvd').length
      invoice = Invoice.create_invoice({
        from: purchase_order,
        invoice_type: 'dvd',
        customer_id: dvd_customer.id,
        number: "#{number + 2464}D",
        sent_date: Date.today,
        po_number: purchase_order.number,
        billing_name: dvd_customer.billing_name,
        billing_address1: dvd_customer.address1,
        billing_address2: dvd_customer.address2,
        billing_city: dvd_customer.city,
        billing_state: dvd_customer.state,
        billing_zip: dvd_customer.zip,
        billing_country: dvd_customer.country,
        shipping_name: purchase_order.name,
        shipping_address1: purchase_order.address1,
        shipping_address2: purchase_order.address2,
        shipping_city: purchase_order.city,
        shipping_state: purchase_order.state,
        shipping_zip: purchase_order.zip,
        shipping_country: purchase_order.country,
        payment_terms: dvd_customer.payment_terms,
        notes: purchase_order.notes
      })
      invoice.export!(pathname)
      attachments = [File.open("#{pathname}/Invoice #{invoice.number}.pdf", "r")]
      message_params = {
        from: current_user.email,
        to: dvd_customer.invoices_email,
        cc: current_user.email,
        subject: "Invoice for PO #{purchase_order.number}",
        text: "Hello,\n\nPlease find your invoice attached, in PDF format.\n\nKind Regards,\n\n#{current_user.email_signature}",
        attachment: attachments
      }
      mg_client.send_message 'filmmovement.com', message_params
    end

    # send shipping files
    source_doc = nil
    unless reporting_only
      source_doc = 5533 + PurchaseOrder.find_by_sql("SELECT * FROM purchase_orders WHERE ship_date IS NOT NULL AND reporting_only != 't'").count
      purchase_order.create_shipping_files(pathname, source_doc)
      attachments = [File.open("#{pathname}/#{source_doc}_worderline.txt", "r"), File.open("#{pathname}/#{source_doc}_worder.txt", "r")]
      message_params = {
        from: current_user.email,
        to: 'fulfillment@theadsgroup.com',
        cc: current_user.email,
        subject: "Film Movement Sales Order #{source_doc}",
        text: "Please see attached shipping files.",
        attachment: attachments
      }
      mg_client.send_message 'filmmovement.com', message_params
      purchase_order.decrement_stock!
    end

    purchase_order.update({ ship_date: Date.today, source_doc: source_doc, reporting_only: reporting_only })
  end
end
