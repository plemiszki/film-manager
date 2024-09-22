json.dvdCustomer do
  json.id @dvd_customer.id
  json.name @dvd_customer.name
  json.discount @dvd_customer.per_unit ? "$#{number_with_precision(@dvd_customer.per_unit, precision: 2, delimiter: ',')} / unit" : (@dvd_customer.discount || "")
  json.consignment @dvd_customer.consignment
  json.notes @dvd_customer.notes
  json.sageId @dvd_customer.sage_id
  json.invoicesEmail @dvd_customer.invoices_email
  json.creditMemoEmail @dvd_customer.credit_memo_email
  json.paymentTerms @dvd_customer.payment_terms
  json.billingName @dvd_customer.billing_name || ""
  json.address1 @dvd_customer.address1 || ""
  json.address2 @dvd_customer.address2 || ""
  json.city @dvd_customer.city || ""
  json.state @dvd_customer.state || ""
  json.zip @dvd_customer.zip || ""
  json.country @dvd_customer.country || ""
  json.includeInTitleReport @dvd_customer.include_in_title_report
  json.nickname @dvd_customer.nickname
  json.stripeId @dvd_customer.get_stripe_id
  json.useStripe @dvd_customer.use_stripe
end
