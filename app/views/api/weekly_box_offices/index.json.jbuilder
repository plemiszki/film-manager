json.weeklyBoxOffices @weekly_box_offices do |weekly_box_office|
  json.id weekly_box_office.id
  json.amount dollarify(number_with_precision(weekly_box_office.amount, precision: 2, delimiter: ','))
  json.order weekly_box_office.order
end
json.calculations do
  json.totalGross dollarify(number_with_precision(@calculations[:total_gross], precision: 2, delimiter: ','))
  json.ourShare dollarify(number_with_precision(@calculations[:our_share], precision: 2, delimiter: ','))
  json.received dollarify(number_with_precision(@calculations[:received], precision: 2, delimiter: ','))
  json.owed dollarify(number_with_precision(@calculations[:owed], precision: 2, delimiter: ','))
end
