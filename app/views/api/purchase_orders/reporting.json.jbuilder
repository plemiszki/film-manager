json.dvdCustomers @dvd_customers do |dvd_customer|
  next if dvd_customer.id == 33 # do not include Unobstructed View
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.sales @sales[dvd_customer.id].map { |key, value| [key, dollarify(number_with_precision(value, precision: 2, delimiter: ','))] }.to_h
end
json.monthTotals @sales[:month_totals].map { |key, value| dollarify(number_with_precision(value, precision: 2, delimiter: ',')) }
json.yearTotal dollarify(number_with_precision(@sales[:year_total], precision: 2, delimiter: ','))
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.title dvd.feature.title
  json.type dvd.dvd_type.name
  json.retailDate dvd.retail_date.strftime("%m/%d/%Y")
  json.amazonUnits @dvd_units[dvd.id][:amazon]
  json.amazonSales dollarify(number_with_precision(@dvd_sales[dvd.id][:amazon], precision: 2, delimiter: ','))
  json.aecUnits @dvd_units[dvd.id][:aec]
  json.aecSales dollarify(number_with_precision(@dvd_sales[dvd.id][:aec], precision: 2, delimiter: ','))
  json.bakerUnits @dvd_units[dvd.id][:baker]
  json.bakerSales dollarify(number_with_precision(@dvd_sales[dvd.id][:baker], precision: 2, delimiter: ','))
  json.ingramUnits @dvd_units[dvd.id][:ingram]
  json.ingramSales dollarify(number_with_precision(@dvd_sales[dvd.id][:ingram], precision: 2, delimiter: ','))
  json.midwestUnits @dvd_units[dvd.id][:midwest]
  json.midwestSales dollarify(number_with_precision(@dvd_sales[dvd.id][:midwest], precision: 2, delimiter: ','))
  json.totalUnits @dvd_units[dvd.id][:total_units]
  json.totalSales dollarify(number_with_precision(@dvd_sales[dvd.id][:total_sales], precision: 2, delimiter: ','))
end
