FactoryBot.define do

  factory :return do
    number { '012345678' }
    customer_id { 1 }
    date { Date.today }
    month { Date.today.month }
    year { Date.today.year }
  end
  
end
