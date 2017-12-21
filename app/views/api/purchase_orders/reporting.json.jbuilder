json.dvdCustomers @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.janSales @sales[1]
  json.febSales @sales[2]
  json.marSales @sales[3]
  json.aprSales @sales[4]
  json.maySales @sales[5]
  json.junSales @sales[6]
  json.julSales @sales[7]
  json.augSales @sales[8]
  json.sepSales @sales[9]
  json.octSales @sales[10]
  json.novSales @sales[11]
  json.decSales @sales[12]
  # json.value dollarify(number_with_precision(10000, precision: 2, delimiter: ',')).gsub('$', '')
end
