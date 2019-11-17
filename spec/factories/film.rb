FactoryBot.define do
  factory :film do
    film_type { 'Feature' }
    length { 90 }
    year { 2002 }
    label_id { Label.last.id }

    factory :no_expenses_recouped_film do
      title { 'No Expenses Recouped' }
    end

    factory :expenses_recouped_from_top_film do
      title { 'Expenses Recouped From Top' }
      deal_type_id { 2 }
    end
  end
end
