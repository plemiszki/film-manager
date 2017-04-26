json.reports @reports do |report|
  json.id report.id
  json.film @film.title
  json.filmId @film.id
  json.dealId @film.deal_type_id
  json.expenseCap dollarify(number_with_precision(@film.expense_cap, precision: 2, delimiter: ','))
  json.quarter report.quarter
  json.year report.year
  json.grPercentage @film.gr_percentage.to_s || ""
  json.currentTotal dollarify(number_with_precision(report.current_total, precision: 2, delimiter: ','))
  json.currentTotalRevenue dollarify(number_with_precision(report.current_total_revenue, precision: 2, delimiter: ','))
  json.currentTotalExpenses dollarify(number_with_precision(report.current_total_expenses, precision: 2, delimiter: ','))
  json.currentShareMinusExpenses dollarify(number_with_precision(report.current_share_minus_expenses, precision: 2, delimiter: ','))
  json.cumeTotal dollarify(number_with_precision(report.cume_total, precision: 2, delimiter: ','))
  json.cumeTotalRevenue dollarify(number_with_precision(report.cume_total_revenue, precision: 2, delimiter: ','))
  json.cumeTotalExpenses dollarify(number_with_precision(report.cume_total_expenses, precision: 2, delimiter: ','))
  json.joinedTotal dollarify(number_with_precision(report.joined_total, precision: 2, delimiter: ','))
  json.joinedTotalRevenue dollarify(number_with_precision(report.joined_total_revenue, precision: 2, delimiter: ','))
  json.joinedTotalExpenses dollarify(number_with_precision(report.joined_total_expenses, precision: 2, delimiter: ','))
  json.mg '$' + number_with_precision(report.mg, precision: 2, delimiter: ',')
  json.eAndO '$' + number_with_precision(report.e_and_o, precision: 2, delimiter: ',')
  json.amountPaid '$' + number_with_precision(report.amount_paid, precision: 2, delimiter: ',')
  json.amountDue dollarify(number_with_precision(report.amount_due, precision: 2, delimiter: ','))
  json.joinedAmountDue dollarify(number_with_precision(report.joined_amount_due, precision: 2, delimiter: ','))
end
json.streams @streams do |stream|
  json.id stream.id
  json.nickname stream.revenue_stream.nickname || stream.revenue_stream.name
  json.licensorPercentage stream.licensor_percentage.to_s || ""
  json.currentRevenue '$' + number_with_precision(stream.current_revenue, precision: 2, delimiter: ',')
  json.currentGr '$' + number_with_precision(stream.current_gr, precision: 2, delimiter: ',')
  json.currentExpense '$' + number_with_precision(stream.current_expense, precision: 2, delimiter: ',')
  json.currentDifference dollarify(number_with_precision(stream.current_difference, precision: 2, delimiter: ','))
  json.currentLicensorShare dollarify(number_with_precision(stream.current_licensor_share, precision: 2, delimiter: ','))
  json.cumeRevenue '$' + number_with_precision(stream.cume_revenue, precision: 2, delimiter: ',')
  json.cumeGr '$' + number_with_precision(stream.cume_gr, precision: 2, delimiter: ',')
  json.cumeExpense '$' + number_with_precision(stream.cume_expense, precision: 2, delimiter: ',')
  json.cumeDifference dollarify(number_with_precision(stream.cume_difference, precision: 2, delimiter: ','))
  json.cumeLicensorShare dollarify(number_with_precision(stream.cume_licensor_share, precision: 2, delimiter: ','))
  json.joinedRevenue '$' + number_with_precision(stream.joined_revenue, precision: 2, delimiter: ',')
  json.joinedGr '$' + number_with_precision(stream.joined_gr, precision: 2, delimiter: ',')
  json.joinedExpense '$' + number_with_precision(stream.joined_expense, precision: 2, delimiter: ',')
  json.joinedDifference dollarify(number_with_precision(stream.joined_difference, precision: 2, delimiter: ','))
  json.joinedLicensorShare dollarify(number_with_precision(stream.joined_licensor_share, precision: 2, delimiter: ','))
end
