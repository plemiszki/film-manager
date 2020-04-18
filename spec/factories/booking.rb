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

    factory :future_booking do
      start_date { Date.today + 1.month }
      end_date { Date.today + 1.month }
    end

    factory :past_booking do
      start_date { Date.today - 1.month }
      end_date { Date.today - 1.month }
    end

  end

end
