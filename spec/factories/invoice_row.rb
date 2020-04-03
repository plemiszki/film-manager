FactoryBot.define do

  factory :invoice_row do
    invoice_id { 1 }
    item_type { 'dvd' }
    item_label { 'Some Film' }
    item_id { 1 }
    item_qty { 2 }
    unit_price { 12.47 }
    total_price { 24.94 }
  end

end
