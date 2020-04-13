FactoryBot.define do

  factory :digital_retailer do
    name { 'iTunes' }
    billing_name { 'Apple iTunes' }
    billing_address1 { '1 Infinite Loop' }
    billing_address2 { 'Room 1A' }
    billing_city { 'Cupertino' }
    billing_state { 'CA' }
    billing_zip { '95015' }
    billing_country { 'USA' }
    sage_id { 'Apple iTns' }
  end

end
