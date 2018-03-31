json.weeklyTerms @weekly_terms do |weekly_term|
  json.id weekly_term.id
  json.terms weekly_term.terms
  json.order weekly_term.order
end
json.calculations do
  json.totalGross dollarify(number_with_precision(@calculations[:total_gross], precision: 2, delimiter: ','))
  json.ourShare dollarify(number_with_precision(@calculations[:our_share], precision: 2, delimiter: ','))
  json.received dollarify(number_with_precision(@calculations[:received], precision: 2, delimiter: ','))
  json.owed dollarify(number_with_precision(@calculations[:owed], precision: 2, delimiter: ','))
end
