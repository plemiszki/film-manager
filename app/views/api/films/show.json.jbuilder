json.film do
  json.id @film.id
  json.title @film.title
  json.filmType @film.film_type
  json.startDate @film.start_date ? @film.start_date.strftime("%-m/%-d/%Y") : ""
  json.endDate @film.end_date ? @film.end_date.strftime("%-m/%-d/%Y") : ""
  json.licensorId @film.licensor_id || ""
  json.dealTypeId @film.deal_type_id.to_s
  json.daysStatementDue @film.days_statement_due.to_s
  json.grPercentage @film.gr_percentage.to_s || ""
  json.expenseCap '$' + number_with_precision(@film.expense_cap, precision: 2, delimiter: ',')
  json.mg '$' + number_with_precision(@film.mg, precision: 2, delimiter: ',')
  json.eAndO '$' + number_with_precision(@film.e_and_o, precision: 2, delimiter: ',')
  json.sageId @film.sage_id || ""
  json.royaltyNotes @film.royalty_notes || ""
  json.reserve @film.reserve
  json.reservePercentage @film.reserve_percentage
  json.reserveQuarters @film.reserve_quarters
  json.exportReports @film.export_reports
  json.sendReports @film.send_reports
  json.active @film.active
  json.dayAndDate @film.day_and_date
  json.sellOffPeriod @film.sell_off_period.to_s
  json.autoRenew @film.auto_renew
  json.autoRenewTerm @film.auto_renew_term.to_s
  json.autoRenewDaysNotice @film.auto_renew_days_notice.to_s
  json.autoRenewOptOut @film.auto_renew_opt_out
  json.year @film.year.to_s || ""
  json.length @film.length.to_s || ""
  json.synopsis @film.synopsis || ""
  json.shortSynopsis @film.short_synopsis || ""
  json.vodSynopsis @film.vod_synopsis || ""
  json.logline @film.logline || ""
  json.institutionalSynopsis @film.institutional_synopsis || ""
  json.vimeoTrailer @film.vimeo_trailer || ""
  json.youtubeTrailer @film.youtube_trailer || ""
  json.proresTrailer @film.prores_trailer || ""
  json.standaloneSite @film.standalone_site || ""
  json.facebookLink @film.facebook_link || ""
  json.twitterLink @film.twitter_link || ""
  json.instagramLink @film.instagram_link || ""
  json.labelId @film.label_id.to_s
  json.clubDate @film.club_date ? @film.club_date.strftime("%-m/%-d/%Y") : ""
  json.ignoreSageId @film.ignore_sage_id
  json.theatricalCount @bookings.where(booking_type: 'Theatrical').count
  json.festivalCount @bookings.where(booking_type: 'Festival').count
  json.nonTheatricalCount @bookings.where(booking_type: 'Non-Theatrical').count
  json.virtualCount @virtual_bookings.count
  json.avodRelease @film.avod_release ? (@film.avod_release.strftime("%-m/%-d/%Y") + (@film.avod_tentative ? '?' : '')) : ""
  json.svodRelease @film.svod_release ? (@film.svod_release.strftime("%-m/%-d/%Y") + (@film.svod_tentative ? '?' : '')) : ""
  json.tvodRelease @film.tvod_release ? (@film.tvod_release.strftime("%-m/%-d/%Y") + (@film.tvod_tentative ? '?' : '')) : ""
  json.theatricalRelease @film.theatrical_release ? (@film.theatrical_release.strftime("%-m/%-d/%Y") + (@film.theatrical_tentative ? '?' : '')) : ""
  json.fmPlusRelease @film.fm_plus_release ? (@film.fm_plus_release.strftime("%-m/%-d/%Y") + (@film.fm_plus_tentative ? '?' : '')) : ""
  json.eduPage @film.edu_page
  json.videoPage @film.video_page
  json.nowPlayingPage @film.now_playing_page
  json.artworkUrl @film.artwork_url || ""
  json.fmPlusUrl @film.fm_plus_url
  json.aspectRatio @film.aspect_ratio
  json.rating @film.rating
  json.soundConfig @film.sound_config
  json.certifiedFresh @film.certified_fresh
  json.criticsPick @film.critics_pick
  json.imdbId @film.imdb_id
  json.acceptDelivery @film.accept_delivery ? @film.accept_delivery.strftime("%-m/%-d/%Y") : ""
  json.rentalUrl @film.rental_url
  json.rentalPrice '$' + number_with_precision(@film.rental_price, precision: 2, delimiter: ',')
  json.rentalDays @film.rental_days.to_s
  json.tvRating @film.tv_rating
  json.contractualObligations @film.contractual_obligations
  json.msrpPreStreet '$' + number_with_precision(@film.msrp_pre_street, precision: 2, delimiter: ',')
  json.pprPreStreet '$' + number_with_precision(@film.ppr_pre_street, precision: 2, delimiter: ',')
  json.drlPreStreet '$' + number_with_precision(@film.drl_pre_street, precision: 2, delimiter: ',')
  json.pprDrlPreStreet '$' + number_with_precision(@film.ppr_drl_pre_street, precision: 2, delimiter: ',')
  json.pprPostStreet '$' + number_with_precision(@film.ppr_post_street, precision: 2, delimiter: ',')
  json.drlPostStreet '$' + number_with_precision(@film.drl_post_street, precision: 2, delimiter: ',')
  json.pprDrlPostStreet '$' + number_with_precision(@film.ppr_drl_post_street, precision: 2, delimiter: ',')
  json.msrpPreStreetMember '$' + number_with_precision(@film.msrp_pre_street_member, precision: 2, delimiter: ',')
  json.pprPreStreetMember '$' + number_with_precision(@film.ppr_pre_street_member, precision: 2, delimiter: ',')
  json.drlPreStreetMember '$' + number_with_precision(@film.drl_pre_street_member, precision: 2, delimiter: ',')
  json.pprDrlPreStreetMember '$' + number_with_precision(@film.ppr_drl_pre_street_member, precision: 2, delimiter: ',')
  json.pprPostStreetMember '$' + number_with_precision(@film.ppr_post_street_member, precision: 2, delimiter: ',')
  json.drlPostStreetMember '$' + number_with_precision(@film.drl_post_street_member, precision: 2, delimiter: ',')
  json.pprDrlPostStreetMember '$' + number_with_precision(@film.ppr_drl_post_street_member, precision: 2, delimiter: ',')
  json.totalBoxOffice '$' + number_with_precision(@total_box_office, precision: 2, delimiter: ',')
  json.missingReports @missing_reports
  json.xmlIncludeCaptions @film.xml_include_captions
  json.xmlIncludeTrailer @film.xml_include_trailer
  json.xmlVideoFilename @film.xml_video_filename
  json.xmlTrailerFilename @film.xml_trailer_filename
  json.xmlCaptionFilename @film.xml_caption_filename
  json.xmlSubtitlesFilename @film.xml_subtitles_filename
  json.xmlMmcFilename @film.xml_mmc_filename
  json.xmlMecFilename @film.xml_mec_filename
  json.xmlExportFilenameDefaults do
    json.mmc @film.xml_mmc_filename_default
    json.mec @film.xml_mec_filename_default
    json.video @film.xml_video_filename_default
    json.trailer @film.xml_trailer_filename_default
    json.subtitles @film.xml_subtitles_filename_default
    json.captions @film.xml_captions_filename_default
  end
end
json.dealTemplates @templates
json.licensors @licensors do |licensor|
  json.id licensor.id
  json.name licensor.name
end
json.revenueStreams @revenue_streams do |revenue_stream|
  json.id revenue_stream.id
  json.name revenue_stream.name
  json.nickname revenue_stream.nickname
end
json.filmRevenuePercentages @film_revenue_percentages do |film_revenue_percentage|
  json.id film_revenue_percentage.id
  json.filmId film_revenue_percentage.film_id
  json.revenueStreamId film_revenue_percentage.revenue_stream_id
  json.value film_revenue_percentage.value
end
json.crossedFilms @crossed_films do |crossed_film|
  json.id crossed_film.id
  json.title crossed_film.crossed_film.title
end
json.otherCrossedFilms @other_crossed_films do |film|
  json.id film.id
  json.title film.title
end
json.reports @reports do |report|
  json.id report.id
  json.year report.year
  json.quarter report.quarter
end
json.filmRights @rights do |right|
  json.id right.id
  json.name right.right.name
  json.order right.right.order
  json.territory right.territory.name
  json.startDate right.start_date ? right.start_date.strftime("%-m/%-d/%Y") : ''
  json.endDate right.end_date ? right.end_date.strftime("%-m/%-d/%Y") : ''
  json.exclusive right.exclusive ? 'Yes' : 'No'
end
json.subRights @sub_rights do |right|
  json.id right.id
  json.rightName right.right.name
  json.order right.right.order
  json.territory right.territory.name
  json.sublicensorName right.sublicensor.name
  json.startDate right.start_date ? right.start_date.strftime("%-m/%-d/%Y") : ''
  json.endDate right.end_date ? right.end_date.strftime("%-m/%-d/%Y") : ''
  json.exclusive right.exclusive ? 'Yes' : 'No'
end
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.type dvd.dvd_type.name
  json.featureTitle dvd.feature.title
  json.upc dvd.upc
  json.price '$' + number_with_precision(dvd.price, precision: 2, delimiter: ',')
  json.active dvd.active ? 'Yes': 'No'
end
json.dvdTypes @dvd_types do |dvd_type|
  json.id dvd_type.id
  json.name dvd_type.name
end
json.formats @formats do |fmt|
  json.id fmt.id
  json.name fmt.name
end
json.filmFormats @film_formats do |film_format|
  json.id film_format.id
  json.format film_format.format.name
end
json.countries @countries do |country|
  json.id country.id
  json.name country.name
end
json.filmCountries @film_countries do |film_country|
  json.id film_country.id
  json.country film_country.country.name
  json.order film_country.order
end
json.languages @languages do |language|
  json.id language.id
  json.name language.name
end
json.filmLanguages @film_languages do |film_language|
  json.id film_language.id
  json.language film_language.language.name
  json.order film_language.order
end
json.genres @genres do |genre|
  json.id genre.id
  json.name genre.name
end
json.filmGenres @film_genres do |film_genre|
  json.id film_genre.id
  json.genre film_genre.genre.name
  json.order film_genre.order
end
json.topics @topics do |topic|
  json.id topic.id
  json.name topic.name
end
json.filmTopics @film_topics do |film_topic|
  json.id film_topic.id
  json.topic film_topic.topic.name
end
json.labels @labels
json.quotes @quotes do |quote|
  json.id quote.id
  json.text quote.text
  json.author quote.author
  json.publication quote.publication
  json.filmId quote.film_id
  json.order quote.order
end
json.laurels @laurels do |laurel|
  json.id laurel.id
  json.result laurel.result
  json.awardName laurel.award_name
  json.festival laurel.festival
  json.filmId laurel.film_id
  json.order laurel.order
end
json.relatedFilms @related_films do |related_film|
  json.id related_film.id
  json.filmId related_film.film_id
  json.title related_film.other_film.title
  json.order related_film.order
end
json.otherFilms @other_films do |film|
  json.id film.id
  json.title film.title
end
json.directors @directors do |director|
  json.id director.id
  json.filmId director.film_id
  json.firstName director.first_name
  json.lastName director.last_name
  json.order director.order
end
json.actors @actors do |actor|
  json.id actor.id
  json.actorableId actor.actorable_id
  json.firstName actor.first_name
  json.lastName actor.last_name
  json.order actor.order
end
json.bookings @bookings do |booking|
  json.id booking.id
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%Y")
  json.type booking.booking_type
  json.valid @calculations[booking.id][:valid]
  json.owed dollarify(number_with_precision(@calculations[booking.id][:owed], precision: 2, delimiter: ','))
end
json.virtualBookings @virtual_bookings do |booking|
  json.id booking.id
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%Y")
  json.type 'Virtual'
end
json.digitalRetailers @digital_retailers do |digital_retailer|
  json.id digital_retailer.id
  json.name digital_retailer.name
end
json.digitalRetailerFilms @digital_retailer_films do |digital_retailer_film|
  json.id digital_retailer_film.id
  json.name digital_retailer_film.digital_retailer.name
  json.url digital_retailer_film.url
end
json.eduPlatforms @edu_platforms do |edu_platform|
  json.id edu_platform.id
  json.name edu_platform.name
end
json.eduPlatformFilms @edu_platform_films do |edu_platform_film|
  json.id edu_platform_film.id
  json.name edu_platform_film.edu_platform.name
  json.url edu_platform_film.url
end
json.schedule @schedule
json.episodes @episodes do |episode|
  json.id episode.id
  json.title episode.title
  json.seasonNumber episode.season_number
  json.episodeNumber episode.episode_number
end
json.alternateLengths @alternate_lengths do |alternate_length|
  json.id alternate_length.id
  json.length alternate_length.length
end
json.alternateSubs @alternate_subs do |alternate_sub|
  json.id alternate_sub.id
  json.languageName alternate_sub.language.name
end
json.alternateAudios @alternate_audios do |alternate_audio|
  json.id alternate_audio.id
  json.languageName alternate_audio.language.name
end
json.subtitleLanguages @subtitle_languages do |language|
  json.id language.id
  json.name language.name
end
json.audioLanguages @audio_languages do |language|
  json.id language.id
  json.name language.name
end
json.amazonLanguages @amazon_languages do |amazon_language|
  json.id amazon_language.id
  json.name amazon_language.name
  json.code amazon_language.code
end
json.amazonLanguageFilms @amazon_language_films do |amazon_language_film|
  json.id amazon_language_film.id
  json.name amazon_language_film.amazon_language.name
end
json.amazonGenres @amazon_genres do |amazon_genre|
  json.id amazon_genre.id
  json.code amazon_genre.code
end
json.amazonGenreFilms @amazon_genre_films do |amazon_genre_film|
  json.id amazon_genre_film.id
  json.code amazon_genre_film.amazon_genre.code
end
