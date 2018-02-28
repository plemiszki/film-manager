json.payments @payments do |payment|
  json.id payment.id
  json.amount dollarify(number_with_precision(payment.amount, precision: 2, delimiter: ','))
  json.date payment.date.strftime("%-m/%-d/%y")
  json.notes payment.notes
end
