json.dvdCustomers @dvd_customers do |dvd_customer|
  next if dvd_customer.id == 33 # do not include Unobstructed View
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.includeInTitleReport dvd_customer.include_in_title_report
  json.nickname dvd_customer.nickname
  json.sales @sales[dvd_customer.id].map { |key, value| [key, dollarify(number_with_precision(value, precision: 2, delimiter: ','))] }.to_h
end
json.monthTotals @sales[:month_totals].map { |key, value| dollarify(number_with_precision(value, precision: 2, delimiter: ',')) }
json.yearTotal dollarify(number_with_precision(@sales[:year_total], precision: 2, delimiter: ','))
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.title dvd.feature.title
  json.type dvd.dvd_type.name
  json.retailDate dvd.retail_date.strftime("%m/%d/%Y")
  json.sales @title_report_dvd_customers do |customer|
    json.units @dvd_units[dvd.id][customer.id]
    json.amount dollarify(number_with_precision(@dvd_sales[dvd.id][customer.id], precision: 2, delimiter: ','))
  end
  json.totalUnits @dvd_units[dvd.id][:total_units]
  json.totalSales dollarify(number_with_precision(@dvd_sales[dvd.id][:total_sales], precision: 2, delimiter: ','))
end
