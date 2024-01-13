FactoryBot.define do

  factory :institution_order_film do
    film_id { 1 }
    institution_order_id { 1 }
    licensed_rights { "disc_only" }
    price { 200 }
  end

end
