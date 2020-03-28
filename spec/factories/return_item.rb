FactoryBot.define do

  factory :return_item do
    return_id { 1 }
    item_type { 'dvd' }
    item_id { 1 }
    order { 0 }
    qty { 1 }
    amount { 7.99 }
  end

end
