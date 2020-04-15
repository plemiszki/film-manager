FactoryBot.define do

  factory :actor do
    first_name { 'Tom' }
    last_name { 'Hanks' }
    order { 0 }
    actorable_id { 1 }
    actorable_type { 'Film' }

    factory :episode_actor do
      actorable_type { 'Episode' }
    end

  end

end
