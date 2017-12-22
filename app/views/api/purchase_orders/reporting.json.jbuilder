json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.sales @sales[dvd_customer.id].map { |key, value| [key, dollarify(number_with_precision(value, precision: 2, delimiter: ','))] }.to_h
end
json.monthTotals @sales[:month_totals].map { |key, value| dollarify(number_with_precision(value, precision: 2, delimiter: ',')) }
json.yearTotal dollarify(number_with_precision(@sales[:year_total], precision: 2, delimiter: ','))
