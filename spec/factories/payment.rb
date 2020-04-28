FactoryBot.define do

  factory :payment do
    booking_id { 1 }
    amount { 50 }
    date { Date.today }
  end

end
