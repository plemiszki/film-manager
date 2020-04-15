FactoryBot.define do

  factory :episode do
    title { 'Pilot' }
    episode_number { 1 }
    season_number { 1 }
    length { 60 }
    synopsis { 'This is the synopsis of the episode.' }
  end

end
