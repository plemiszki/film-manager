FactoryBot.define do

  factory :credit_memo do
    sent_date { Date.today }
    number { '23' }
    customer_id { 1 }
    return_number { 'NH345DJ' }
    billing_name { 'Alliance Inventory' }
    billing_address1 { '300 Omicron Court' }
    billing_address2 { '' }
    billing_city { 'Shepherdsville' }
    billing_state { 'KY' }
    billing_zip { '40165' }
    billing_country { 'USA' }
  end

end
