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

    factory :theatrical_expenses_recouped_from_top_film do
      title { 'Theatrical Expenses Recouped From Top' }
      deal_type_id { 3 }
    end

    factory :expenses_recouped_from_licensor_share_film do
      title { 'Expenses Recouped From Licensor Share' }
      deal_type_id { 4 }
    end

    factory :gr_percentage_film do
      title { 'GR Percentage' }
      deal_type_id { 5 }
      gr_percentage { 20 }
    end

    factory :gr_percentage_theatrical_film do
      title { 'GR Percentage Theatrical/Non-Theatrical' }
      deal_type_id { 6 }
      gr_percentage { 20 }
    end
  end
end
