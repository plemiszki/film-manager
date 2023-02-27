json.array!(@films) do |film|
  json.id film.id
  json.title film.title
  json.active film.active
  json.film_type film.film_type
  json.label film.proper_label_name
  json.year film.year
  json.length film.length
  json.synopsis film.synopsis
  json.short_synopsis film.short_synopsis
  json.logline film.logline
  json.vod_synopsis film.vod_synopsis
  json.institutional_synopsis film.institutional_synopsis
  json.fm_plus_link film.fm_plus_url
  json.vimeo_trailer film.vimeo_trailer
  json.youtube_trailer film.youtube_trailer
  json.prores_trailer film.prores_trailer
  json.standalone_site film.standalone_site
  json.facebook_link film.facebook_link
  json.twitter_link film.twitter_link
  json.instagram_link film.instagram_link
  json.club_date film.club_date ? film.club_date.strftime("%-m/%-d/%y") : ""
  json.tvod_release film.tvod_release ? film.tvod_release.strftime("%-m/%-d/%y") : ""
  json.edu_page film.edu_page
  json.video_page film.video_page
  json.now_playing_page film.now_playing_page
  json.rating film.rating
  json.aspect_ratio film.aspect_ratio
  json.sound_config film.sound_config
  json.certified_fresh film.certified_fresh
  json.critics_pick film.critics_pick
  json.theatrical_release film.theatrical_release || ""
  json.imdb_id film.imdb_id
  json.artwork_url film.artwork_url || ""
  json.day_and_date film.day_and_date
  json.rental_url film.rental_url
  json.rental_days film.rental_days
  json.rental_price film.rental_price
  json.msrp_pre_street dollarify(film.msrp_pre_street)
  json.ppr_pre_street dollarify(film.ppr_pre_street)
  json.ppr_post_street dollarify(film.ppr_post_street)
  json.drl_pre_street dollarify(film.drl_pre_street)
  json.drl_post_street dollarify(film.drl_post_street)
  json.ppr_drl_pre_street dollarify(film.ppr_drl_pre_street)
  json.ppr_drl_post_street dollarify(film.ppr_drl_post_street)
  json.msrp_pre_street_member dollarify(film.msrp_pre_street_member)
  json.ppr_pre_street_member dollarify(film.ppr_pre_street_member)
  json.ppr_post_street_member dollarify(film.ppr_post_street_member)
  json.drl_pre_street_member dollarify(film.drl_pre_street_member)
  json.drl_post_street_member dollarify(film.drl_post_street_member)
  json.ppr_drl_pre_street_member dollarify(film.ppr_drl_pre_street_member)
  json.ppr_drl_post_street_member dollarify(film.ppr_drl_post_street_member)
  json.screening_formats film.formats do |format|
    json.id format.id
    json.name format.name
  end
  json.countries film.film_countries do |film_country|
    json.id film_country.country.id
    json.name film_country.country.name
    json.order film_country.order
  end
  json.languages film.film_languages do |film_language|
    json.id film_language.language.id
    json.name film_language.language.name
    json.order film_language.order
  end
  json.genres film.film_genres do |film_genre|
    json.id film_genre.genre.id
    json.name film_genre.genre.name
    json.order film_genre.order
  end
  json.topics film.topics do |topic|
    json.id topic.id
    json.name topic.name
  end
  json.directors film.directors do |director|
    json.id director.id
    json.first_name director.first_name
    json.last_name director.last_name
    json.order director.order
  end
  json.cast film.actors do |actor|
    json.id actor.id
    json.first_name actor.first_name
    json.last_name actor.last_name
    json.order actor.order
  end
  json.laurels film.laurels do |laurel|
    json.id laurel.id
    json.order laurel.order
    json.result laurel.result
    json.award_name laurel.award_name
    json.festival laurel.festival
    json.order laurel.order
  end
  json.quotes film.quotes do |quote|
    json.id quote.id
    json.order quote.order
    json.text quote.text
    json.author quote.author
    json.publication quote.publication
    json.order quote.order
  end
  json.related_films film.related_films do |related_film|
    json.id related_film.id
    json.order related_film.order
    json.other_film_id related_film.other_film_id
  end
  json.dvds film.dvds do |dvd|
    json.id dvd.id
    json.dvd_type dvd.dvd_type.name
    json.feature_film_id dvd.feature_film_id
    json.price dollarify(dvd.price.to_s)
    json.upc dvd.upc
    json.sound_config dvd.sound_config
    json.special_features dvd.special_features
    json.retail_date dvd.retail_date
    json.stock dvd.stock
    json.discs dvd.discs
    json.shorts dvd.dvd_shorts do |dvd_short|
      json.id dvd_short.id
      json.short_id dvd_short.short_id
    end
  end
  json.digital_retailer_links film.digital_retailer_films do |digital_retailer_film|
    json.name digital_retailer_film.digital_retailer.name
    json.url digital_retailer_film.url
  end
  json.edu_platform_links film.edu_platform_films do |edu_platform_film|
    json.name edu_platform_film.edu_platform.name
    json.url edu_platform_film.url
  end
  json.episodes film.episodes do |episode|
    json.title episode.title
    json.season_number episode.season_number
    json.episode_number episode.episode_number
    json.length episode.length
    json.synopsis episode.synopsis
    json.cast episode.actors do |actor|
      json.order actor.order
      json.first_name actor.first_name
      json.last_name actor.last_name
    end
  end
end
