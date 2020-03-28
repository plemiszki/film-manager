FactoryBot.define do

  factory :dvd do
    feature_film_id { 1 }
    dvd_type_id { 1 }
    upc { '616892087410' }
    pre_book_date { Date.parse('1/1/2000') }
    retail_date { Date.parse('1/2/2000') }
    price { 24.95 }
    stock { 62 }
    units_shipped { 200 }
    discs { 1 }
    sound_config { 'mono' }
    special_features { 'director commentary' }
  end
  
end
