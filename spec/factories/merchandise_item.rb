FactoryBot.define do

  factory :merchandise_item do
    merchandise_type_id { 1 }
    name { "Film Movement Women's T-shirt" }
    size { 'Small' }
    price { 19.95 }
    inventory { 10 }
    description { '100% certified organic cotton T-Shirt with Film Movement logo' }
    film_id { 1 }
  end

end
