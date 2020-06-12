FactoryBot.define do

  factory :virtual_booking do
    film_id { 1 }
    venue_id { 1 }
    date_added { Date.today }
    start_date { Date.today }
    end_date { Date.today + 1.day }
    shipping_city { 'New York' }
    shipping_state { 'NY' }
    url { 'https://www.someurl.com' }
  end

end
