FactoryBot.define do

  factory :virtual_booking do

    film_id { 1 }
    venue_id { 1 }
    date_added { Date.today }
    start_date { Date.today }
    end_date { Date.today + 1.day }
    terms { '50%' }
    shipping_city { 'New York' }
    shipping_state { 'NY' }
    url { 'https://www.someurl.com' }
    host { 'FM' }
    deduction { 50 }
    box_office { 500 }
    box_office_received { false }
    email { 'someone@venue.com' }
    billing_name { 'Some Venue' }
    billing_address1 { '6 Sherman Bridge Road' }
    billing_address2 { 'Apt 2' }
    billing_city { 'Wayland' }
    billing_state { 'MA' }
    billing_zip { '01778' }
    billing_country { 'USA' }
  end

end
