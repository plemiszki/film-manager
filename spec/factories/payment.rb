FactoryBot.define do

  factory :payment do
    booking_id { 1 }
    amount { 50 }
    date { Date.today }

    factory :virtual_booking_payment do
      booking_type { 'VirtualBooking' }
    end

  end

end
