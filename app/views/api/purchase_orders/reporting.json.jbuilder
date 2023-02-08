json.customersReport @dvd_customers + [{
  id: nil,
  name: "TOTAL",
  include_in_title_report: true,
  jan: "jan",
  feb: 'feb',
  mar: 'mar',
  apr: 'apr',
  may: 'may',
  jun: 'jun',
  jul: 'jul',
  aug: 'aug',
  sep: 'sep',
  oct: 'oct',
  nov: 'nov',
  dec: 'dec',
  total: 'total',
}] do |dvd_customer|
  next if dvd_customer['id'] == 33 # do not include Unobstructed View
  json.id dvd_customer['id']
  json.name dvd_customer[:name]
  json.includeInTitleReport dvd_customer[:include_in_title_report]
  json.nickname dvd_customer[:nickname]
  json.total dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][:total], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:year_total], precision: 2, delimiter: ','))
  json.jan dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][1], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][1], precision: 2, delimiter: ','))
  json.feb dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][2], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][2], precision: 2, delimiter: ','))
  json.mar dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][3], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][3], precision: 2, delimiter: ','))
  json.apr dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][4], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][4], precision: 2, delimiter: ','))
  json.may dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][5], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][5], precision: 2, delimiter: ','))
  json.jun dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][6], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][6], precision: 2, delimiter: ','))
  json.jul dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][7], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][7], precision: 2, delimiter: ','))
  json.aug dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][8], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][8], precision: 2, delimiter: ','))
  json.sep dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][9], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][9], precision: 2, delimiter: ','))
  json.oct dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][10], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][10], precision: 2, delimiter: ','))
  json.nov dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][11], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][11], precision: 2, delimiter: ','))
  json.dec dvd_customer['id'] ? dollarify(number_with_precision(@sales[dvd_customer['id']][12], precision: 2, delimiter: ',')) : dollarify(number_with_precision(@sales[:month_totals][12], precision: 2, delimiter: ','))
  json.sales dvd_customer['id'] ? @sales[dvd_customer['id']].map { |key, value| [key, dollarify(number_with_precision(value, precision: 2, delimiter: ','))] }.to_h : []
end
json.titlesReport @dvds do |dvd|
  json.title dvd.feature.title
  json.type dvd.dvd_type.name
  json.retailDate dvd.retail_date.strftime("%-m/%d/%Y")
  json.totalUnits @dvd_units[dvd.id][:total_units]
  json.totalSales dollarify(number_with_precision(@dvd_sales[dvd.id][:total_sales], precision: 2, delimiter: ','))
  @titles_report_dvd_customers.each do |dvd_customer|
    json.set!("#{dvd_customer.get_name.downcase}Units", @dvd_units[dvd.id][dvd_customer.id])
    json.set!("#{dvd_customer.get_name.downcase}Sales", dollarify(number_with_precision(@dvd_sales[dvd.id][dvd_customer.id], precision: 2, delimiter: ',')))
  end
end
