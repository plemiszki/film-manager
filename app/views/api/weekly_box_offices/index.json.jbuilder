json.weeklyBoxOffices @weekly_box_offices do |weekly_box_office|
  json.id weekly_box_office.id
  json.amount dollarify(number_with_precision(weekly_box_office.amount, precision: 2, delimiter: ','))
  json.order weekly_box_office.order
end
