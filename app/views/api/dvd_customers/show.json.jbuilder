json.array! @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.discount dvd_customer.discount
  json.consignment dvd_customer.consignment
  json.notes dvd_customer.notes
  json.sageId dvd_customer.sage_id
  json.invoicesEmail dvd_customer.invoices_email
end
