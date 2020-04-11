FactoryBot.define do

  factory :laurel do
    film_id { 1 }
    result { 'Winner' }
    award_name { 'Best Film' }
    festival { 'Cannes International Film Festival' }
    order { 0 }
  end

end
