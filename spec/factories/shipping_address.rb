FactoryBot.define do

  factory :shipping_address do
    label { 'Label' }
    name { 'Name' }
    address1 { 'Address 1' }
    address2 { 'Address 2' }
    city { 'City' }
    state { 'MA' }
    zip { '01778' }
    country { 'Country' }
    customer_id { '1' }
  end

end
