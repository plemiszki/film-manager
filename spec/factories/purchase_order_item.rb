FactoryBot.define do

  factory :purchase_order_item do
    purchase_order_id { 1 }
    item_id { 1 }
    item_type { 'dvd' }
    order { 0 }
    qty { 1 }
  end

end
