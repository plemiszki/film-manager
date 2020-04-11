FactoryBot.define do

  factory :quote do
    film_id { 1 }
    text { 'This is the greatest film in history.' }
    author { 'Roger Ebert' }
    publication { 'Chicago Sun' }
    order { 0 }
  end

end
