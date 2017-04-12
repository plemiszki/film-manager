json.reports @reports do |report|
  json.id report.id
  json.film @film.title
  json.filmId @film.id
  json.dealId @film.deal_type_id
  json.quarter report.quarter
  json.year report.year
  json.grPercentage @film.gr_percentage.to_s || ""
  json.mg '$' + number_with_precision(report.mg, precision: 2, delimiter: ',')
  json.amountPaid '$' + number_with_precision(report.amount_paid, precision: 2, delimiter: ',')
  json.amountDue '$' + number_with_precision(report.amount_due, precision: 2, delimiter: ',')
end
json.streams @streams do |stream|
  json.id stream.id
  json.nickname stream.revenue_stream.nickname || stream.revenue_stream.name
  json.licensorPercentage stream.licensor_percentage.to_s || ""
  json.currentRevenue '$' + number_with_precision(stream.current_revenue, precision: 2, delimiter: ',')
  json.currentGr '$' + number_with_precision(stream.current_gr, precision: 2, delimiter: ',')
  json.currentExpense '$' + number_with_precision(stream.current_expense, precision: 2, delimiter: ',')
  json.currentDifference '$' + number_with_precision(stream.current_difference, precision: 2, delimiter: ',')
  json.currentLicensorShare '$' + number_with_precision(stream.current_licensor_share, precision: 2, delimiter: ',')
  json.cumeRevenue '$' + number_with_precision(stream.cume_revenue, precision: 2, delimiter: ',')
  json.cumeGr '$' + number_with_precision(stream.cume_gr, precision: 2, delimiter: ',')
  json.cumeExpense '$' + number_with_precision(stream.cume_expense, precision: 2, delimiter: ',')
  json.cumeDifference '$' + number_with_precision(stream.cume_difference, precision: 2, delimiter: ',')
  json.cumeLicensorShare '$' + number_with_precision(stream.cume_licensor_share, precision: 2, delimiter: ',')
end
