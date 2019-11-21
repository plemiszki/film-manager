FactoryBot.define do
  factory :royalty_report do
    year { 2019 }
    quarter { 1 }

    factory :no_expenses_recouped_royalty_report do
      deal_id { 1 }
      film_id { Film.where(deal_type_id: 1).first.id }
    end

    factory :expenses_recouped_from_top_royalty_report do
      deal_id { 2 }
      film_id { Film.where(deal_type_id: 2).first.id }
    end

    factory :theatrical_expenses_recouped_from_top_royalty_report do
      deal_id { 3 }
      film_id { Film.where(deal_type_id: 3).first.id }
    end

    factory :expenses_recouped_from_licensor_share_royalty_report do
      deal_id { 4 }
      film_id { Film.where(deal_type_id: 4).first.id }
    end
  end
end
