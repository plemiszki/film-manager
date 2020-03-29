FactoryBot.define do

  factory :setting do
    next_dvd_invoice_number { 1 }
    next_booking_invoice_number { 1 }
    booking_confirmation_text { 'thanks!' }
  end

end
