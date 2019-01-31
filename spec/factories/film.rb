FactoryBot.define do
  factory :film do
    title { 'Wilby Wonderful' }
    film_type { 'Feature' }
    length { 90 }
    year { 2002 }
    label_id { 1 }
  end
end
