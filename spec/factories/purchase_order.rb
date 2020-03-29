FactoryBot.define do

  factory :purchase_order do
    number { '450000' }
    order_date { Date.today }
    year { Date.today.year }
    month { Date.today.month }
    name { 'name' }
    address1 { 'address 1' }
    address2 { 'address 2' }
    city { 'city' }
    state { 'MA' }
    zip { '01778' }
    country { 'country' }
    notes { 'notes' }
    customer_id { 1 }
  end

end
