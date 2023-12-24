FactoryBot.define do

  factory :institution do
    label { 'Harvard University' }
    sage_id { 'HARVARD' }
    contact_name { 'Bobby Joe' }
    email { 'bobby@harvarduniversity.com' }
    phone { '555-555-5555' }
    billing_name { 'Harvard University' }
    billing_address_1 { 'Massachusetts Hall' }
    billing_address_2 { '' }
    billing_city { 'Cambridge' }
    billing_state { 'MA' }
    billing_zip { '02138' }
    billing_country { 'USA' }
    shipping_name { 'Harvard University' }
    shipping_address_1 { '200 Harvard Yard Mail Center' }
    shipping_address_2 { '1 Oxford Street' }
    shipping_city { 'Cambridge' }
    shipping_state { 'MA' }
    shipping_zip { '02138' }
    shipping_country { 'USA' }
    notes { 'some notes' }
  end

end
