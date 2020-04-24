FactoryBot.define do

  factory :in_theaters_film do
    film_id { 1 }
    order { 0 }
    section { 'In Theaters' }

    factory :coming_soon_film do
      section { 'Coming Soon' }
    end

    factory :repertory_film do
      section { 'Repertory' }
    end
  end

end
