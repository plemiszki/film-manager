FactoryBot.define do

  factory :film do

    film_type { 'Feature' }
    title { 'Wilby Wonderful' }
    licensor_id { 1 }
    length { 90 }
    year { 2002 }
    label_id { Label.last.id }
    mg { 500 }
    e_and_o { 2000 }
    rating { 'Not Rated' }
    aspect_ratio { '16:9' }
    sound_config { 'stereo' }
    fm_plus_url { 'https://www.filmmovementplus.com/wilbywonderful' }
    standalone_site { 'https://www.wilbywonderful.com' }
    vimeo_trailer { 'http://vimeo.com/68840880' }
    youtube_trailer { 'https://www.youtube.com/watch?v=PCu7WguDGGY' }
    prores_trailer { 'https://www.dropbox.com/s/g2ysczkh6ulvrbf/MyArt_Trailer_ProRes.mov?dl=0' }
    facebook_link { 'https://www.facebook.com/wilbywonderful' }
    twitter_link { 'https://twitter.com/wilbywonderful' }
    instagram_link { 'https://www.instagram.com/wilbywonderful' }
    imdb_id { 'tt2328696' }
    active { true }
    edu_page { true }
    video_page { true }
    day_and_date { true }
    certified_fresh { true }
    critics_pick { true }
    export_reports { true }
    send_reports { true }
    ignore_sage_id { true }
    rental_url { 'https://www.filmmovement.com/rentals/wilbywonderful' }
    rental_days { 3 }
    rental_price { 10 }

    msrp_pre_street { 150 }
    ppr_pre_street { 350 }
    drl_pre_street { 499 }
    ppr_drl_pre_street { 599 }

    msrp_pre_street_member { 100 }
    ppr_pre_street_member { 300 }
    drl_pre_street_member { 450 }
    ppr_drl_pre_street_member { 550 }

    msrp_post_street { 24.95 }
    ppr_post_street { 200 }
    drl_post_street { 499 }
    ppr_drl_post_street { 599 }

    msrp_post_street_member { 24.95 }
    ppr_post_street_member { 150 }
    drl_post_street_member { 450 }
    ppr_drl_post_street_member { 550 }

    factory :no_expenses_recouped_film do
      title { 'No Expenses Recouped' }
      ignore_sage_id { false }
    end

    factory :expenses_recouped_from_top_film do
      title { 'Expenses Recouped From Top' }
      deal_type_id { 2 }
      ignore_sage_id { false }
    end

    factory :theatrical_expenses_recouped_from_top_film do
      title { 'Theatrical Expenses Recouped From Top' }
      deal_type_id { 3 }
      ignore_sage_id { false }
    end

    factory :expenses_recouped_from_licensor_share_film do
      title { 'Expenses Recouped From Licensor Share' }
      deal_type_id { 4 }
      ignore_sage_id { false }
    end

    factory :gr_percentage_film do
      title { 'GR Percentage' }
      deal_type_id { 5 }
      gr_percentage { 20 }
      ignore_sage_id { false }
    end

    factory :gr_percentage_theatrical_film do
      title { 'GR Percentage Theatrical & Non-Theatrical' }
      deal_type_id { 6 }
      gr_percentage { 20 }
      ignore_sage_id { false }
    end

    factory :dvd_reserve_film do
      title { 'DVD Reserve' }
      deal_type_id { 2 }
      reserve { true }
      reserve_percentage { 25 }
      reserve_quarters { 2 }
      ignore_sage_id { false }
    end

    factory :tv_series do
      title { 'Nazi Junkies' }
      film_type { 'TV Series' }
    end

  end

end
