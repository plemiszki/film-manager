class SendDvdPoAndInvoice
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(id, current_user_id)
    purchase_order = PurchaseOrder.find(id)
    current_user = User.find(current_user_id)
    dvd_customer = DvdCustomer.find(purchase_order.customer_id)
    if purchase_order.send_invoice
      number = Invoice.where(invoice_type: 'dvd').length
      invoice = Invoice.create_invoice({
        invoice_type: 'dvd',
        from: purchase_order,
        number: "#{number + 1}D",
        sent_date: Date.today,
        po_number: purchase_order.number,
        shipping_name: purchase_order.name,
        shipping_address1: purchase_order.address1,
        shipping_address2: purchase_order.address2,
        shipping_city: purchase_order.city,
        shipping_state: purchase_order.state,
        shipping_zip: purchase_order.zip,
        shipping_country: purchase_order.country
      })
      pathname = Rails.root.join('tmp', Time.now.to_s)
      FileUtils.mkdir_p("#{pathname}")
      invoice.export!(pathname)
      attachments = [File.open("#{pathname}/Invoice #{invoice.number}.pdf", "r")]
      mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      message_params =  { from: current_user.email,
                          to: dvd_customer.invoices_email,
                          subject: "Invoice for PO #{purchase_order.number}",
                          text: "Hello,\n\nPlease find your invoice attached, in PDF format.\n\nKind Regards,\n\n#{current_user.email_signature}",
                          attachment: attachments
                        }
      mg_client.send_message 'filmmovement.com', message_params
    end
    purchase_order.update({ ship_date: Date.today })
  end
end
