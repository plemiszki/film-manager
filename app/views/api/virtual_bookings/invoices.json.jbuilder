json.invoices @invoices do |invoice|
  json.id invoice.id
  json.sentDate invoice.sent_date.strftime("%-m/%-d/%Y")
  json.number invoice.number
  json.total dollarify(number_with_precision(invoice.total, precision: 2, delimiter: ','))
  json.rows invoice.invoice_rows do |row|
    json.label row.item_label
    json.amount dollarify(number_with_precision(row.total_price, precision: 2, delimiter: ','))
  end
  json.payments invoice.invoice_payments do |payment|
    json.id payment.payment_id
  end
end
