json.array! @dvd_customers do |dvd_customer|
  json.id dvd_customer.id
  json.name dvd_customer.name
  json.discount dvd_customer.per_unit ? "$#{number_with_precision(dvd_customer.per_unit, precision: 2, delimiter: ',')} / unit" : (dvd_customer.discount || "")
  json.consignment dvd_customer.consignment
  json.notes dvd_customer.notes
  json.sageId dvd_customer.sage_id
  json.invoicesEmail dvd_customer.invoices_email
  json.paymentTerms dvd_customer.payment_terms
end
