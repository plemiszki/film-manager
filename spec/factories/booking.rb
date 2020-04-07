FactoryBot.define do

  factory :booking do
    film_id { 1 }
    venue_id { 1 }
    booking_type { 'Theatrical' }
    status { 'Confirmed' }
    date_added { Date.today }
    start_date { Date.today }
    end_date { Date.today + 1.day }
    booker_id { 1 }
  end

end
