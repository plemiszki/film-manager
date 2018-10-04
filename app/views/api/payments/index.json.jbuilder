json.payments @payments do |payment|
  json.id payment.id
  json.amount dollarify(number_with_precision(payment.amount, precision: 2, delimiter: ','))
  json.date payment.date.strftime("%-m/%-d/%y")
  json.notes payment.notes
end
json.calculations do
  json.totalGross dollarify(number_with_precision(@calculations[:total_gross], precision: 2, delimiter: ','))
  json.ourShare dollarify(number_with_precision(@calculations[:our_share], precision: 2, delimiter: ','))
  json.received dollarify(number_with_precision(@calculations[:received], precision: 2, delimiter: ','))
  json.owed dollarify(number_with_precision(@calculations[:owed], precision: 2, delimiter: ','))
  json.overage dollarify(number_with_precision(@calculations[:overage], precision: 2, delimiter: ','))
end
