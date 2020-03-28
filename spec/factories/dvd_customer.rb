FactoryBot.define do

  factory :dvd_customer do
    name { 'DVD Vendor' }
    discount { 0.5 }
    consignment { false }
    notes { 'notes' }
    sage_id { 'SAGE ID' }
    invoices_email { 'invoices@dvdvendor.com' }
    payment_terms { '60' }
    per_unit { 7.99 }
    billing_name { 'Billing Name' }
    address1 { 'Address 1' }
    address2 { 'Address 2' }
    city { 'City' }
    state { 'MA' }
    zip { '01778' }
    country { 'Country' }
  end

end
