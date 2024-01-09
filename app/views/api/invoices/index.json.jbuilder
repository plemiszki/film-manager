json.invoices @invoices do |invoice|
  json.id invoice.id
  json.sentDate invoice.sent_date ? invoice.sent_date.strftime("%-m/%-d/%Y") : "(Not Sent)"
  json.sentDateTimestamp invoice.sent_date ? invoice.sent_date.strftime("%Q") : "2147483647"
  json.number invoice.number
  json.type invoice.invoice_type_display_text
  json.poNumber invoice.po_number || ""
  json.notes invoice.notes
  json.total dollarify(number_with_precision(invoice.total, precision: 2, delimiter: ','))
end
json.pageNumbers @page_numbers
json.morePages @more_pages
