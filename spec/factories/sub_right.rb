FactoryBot.define do

  factory :sub_right do

    film_id { 1 }
    right_id { 1 }
    sublicensor_id { 1 }
    territory_id { 1 }
    start_date { Date.today }
    end_date { Date.today + 1.year }

  end

end
