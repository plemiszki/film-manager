FactoryBot.define do

  factory :institution_order do
    institution_id { 1 }
    number { 1000 }
    order_date { Date.new(2024, 1, 3) }
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
    shipping_fee { 15 }
    invoice_notes { 'invoice notes' }
    materials_sent { Date.new(2024, 1, 5) }
    internal_notes { 'internal notes' }
  end

end
