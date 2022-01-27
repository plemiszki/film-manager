FactoryBot.define do

  factory :job do
    job_id { Time.now.to_s }
    name { 'export all' }
    first_line { 'Updating Stock...' }
    second_line { true }
    current_value { 0 }
    total_value { 100 }
    errors_text { '' }
    status { :running }
    killed { false }
  end

end
