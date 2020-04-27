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
    email { 'someone@somevenue.com' }
    advance { 100 }
    shipping_fee { 15 }
    billing_name { 'Film Society of Lincoln Center' }
    billing_address1 { '165 West 65th St' }
    billing_address2 { '4th Fl' }
    billing_city { 'New York' }
    billing_state { 'NY' }
    billing_zip { '10024' }
    billing_country { 'USA' }
    shipping_name { 'New York Film Festival' }
    shipping_address1 { 'The Film Society of Lincoln Center' }
    shipping_address2 { '70 Lincoln Center Plaza' }
    shipping_city { 'New York' }
    shipping_state { 'NY' }
    shipping_zip { '10023' }
    shipping_country { 'USA' }
    notes { 'some notes' }
    terms { '50%' }
    materials_sent { Date.today - 1.week }
    tracking_number { '123456789' }
    shipping_notes { 'some shipping notes' }
    box_office { 1000 }

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
