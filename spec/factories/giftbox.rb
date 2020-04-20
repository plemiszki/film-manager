FactoryBot.define do

  factory :giftbox do
    name { 'Beyond Borders' }
    upc { '857692005017' }
    msrp { 39.95 }
    on_demand { false }
    quantity { 100 }
    sage_id { 'BEYOND BORDERS' }
  end

end
