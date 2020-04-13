FactoryBot.define do

  factory :related_film do
    film_id { 1 }
    other_film_id { 2 }
    order { 0 }
  end

end
