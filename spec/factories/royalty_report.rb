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
      film_id { Film.where(deal_type_id: 2, reserve: false).first.id }
    end

    factory :theatrical_expenses_recouped_from_top_royalty_report do
      deal_id { 3 }
      film_id { Film.where(deal_type_id: 3).first.id }
    end

    factory :expenses_recouped_from_licensor_share_royalty_report do
      deal_id { 4 }
      film_id { Film.where(deal_type_id: 4).first.id }
    end

    factory :gr_percentage_royalty_report do
      deal_id { 5 }
      film_id { Film.where(deal_type_id: 5).first.id }
    end

    factory :gr_percentage_theatrical_royalty_report do
      deal_id { 6 }
      film_id { Film.where(deal_type_id: 6).first.id }
    end

    factory :dvd_reserve_royalty_report do
      deal_id { 2 }
      film_id { Film.find_by_title('DVD Reserve').id }
      mg { 500 }
      e_and_o { 2000 }
    end

  end

end
