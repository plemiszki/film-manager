FactoryBot.define do

  factory :invoice_payment do
    invoice_id { 1 }
    payment_id { 1 }
    amount { 50 }
    date { Date.today }
  end

end
