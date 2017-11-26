json.invoices @invoices do |invoice|
  json.id invoice.id
  json.sentDate invoice.sent_date ? invoice.sent_date : "(Not Sent)"
  json.number invoice.number
  json.type invoice.invoice_type == "dvd" ? "DVD" : "Booking"
  json.poNumber invoice.po_number || ""
end
