FactoryBot.define do

  factory :venue do
    label { 'Film at Lincoln Center' }
    venue_type { 'Theater' }
    sage_id { 'LINCOLN' }
    website { 'lincolncenter.com' }
    contact_name { 'Bobby Joe' }
    email { 'bobby@lincolncenter.com' }
    phone { '555-555-5555' }
    notes { 'some notes' }
  end

end
