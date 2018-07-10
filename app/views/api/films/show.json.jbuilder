json.films @films do |film|
  json.id film.id
  json.title film.title
  json.filmType film.film_type
  json.startDate film.start_date ? film.start_date.strftime("%-m/%-d/%y") : ""
  json.endDate film.end_date ? film.end_date.strftime("%-m/%-d/%y") : ""
  json.licensorId film.licensor_id || ""
  json.dealTypeId film.deal_type_id.to_s
  json.daysStatementDue film.days_statement_due.to_s
  json.grPercentage film.gr_percentage.to_s || ""
  json.expenseCap '$' + number_with_precision(film.expense_cap, precision: 2, delimiter: ',')
  json.mg '$' + number_with_precision(film.mg, precision: 2, delimiter: ',')
  json.eAndO '$' + number_with_precision(film.e_and_o, precision: 2, delimiter: ',')
  json.sageId film.sage_id || ""
  json.royaltyNotes film.royalty_notes || ""
  json.reserve film.reserve
  json.reservePercentage film.reserve_percentage
  json.reserveQuarters film.reserve_quarters
  json.exportReports film.export_reports
  json.sendReports film.send_reports
  json.active film.active
  json.sellOffPeriod film.sell_off_period
  json.autoRenew film.auto_renew
  json.autoRenewTerm film.auto_renew_term
  json.year film.year.to_s || ""
  json.length film.length.to_s || ""
  json.synopsis film.synopsis || ""
  json.shortSynopsis film.short_synopsis || ""
  json.vodSynopsis film.vod_synopsis || ""
  json.logline film.logline || ""
  json.institutionalSynopsis film.institutional_synopsis || ""
  json.vimeoTrailer film.vimeo_trailer || ""
  json.youtubeTrailer film.youtube_trailer || ""
  json.proresTrailer film.prores_trailer || ""
  json.standaloneSite film.standalone_site || ""
  json.facebookLink film.facebook_link || ""
  json.twitterLink film.twitter_link || ""
  json.instagramLink film.instagram_link || ""
  json.labelId film.label_id.to_s
  json.clubDate film.club_date ? film.club_date.strftime("%-m/%-d/%y") : ""
  json.ignoreSageId film.ignore_sage_id
  json.theatricalCount @bookings.where(booking_type: 'Theatrical').count
  json.festivalCount @bookings.where(booking_type: 'Festival').count
  json.nonTheatricalCount @bookings.where(booking_type: 'Non-Theatrical').count
  json.avodRelease film.avod_release ? (film.avod_release.strftime("%-m/%-d/%y") + (film.avod_tentative ? '?' : '')) : ""
  json.svodRelease film.svod_release ? (film.svod_release.strftime("%-m/%-d/%y") + (film.svod_tentative ? '?' : '')) : ""
  json.tvodRelease film.tvod_release ? (film.tvod_release.strftime("%-m/%-d/%y") + (film.tvod_tentative ? '?' : '')) : ""
  json.theatricalRelease film.theatrical_release ? (film.theatrical_release.strftime("%-m/%-d/%y") + (film.theatrical_tentative ? '?' : '')) : ""
  json.eduPage film.edu_page
  json.videoPage film.video_page
  json.artworkUrl film.artwork_url || ""
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
json.reports @reports do |report|
  json.id report.id
  json.year report.year
  json.quarter report.quarter
end
json.rights @rights do |right|
  json.id right.id
  json.name right.right.name
  json.order right.right.order
  json.territory right.territory.name
  json.startDate right.start_date ? right.start_date.strftime("%-m/%-d/%y") : ''
  json.endDate right.end_date ? right.end_date.strftime("%-m/%-d/%y") : ''
  json.exclusive right.exclusive ? 'Yes' : 'No'
end
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.type dvd.dvd_type.name
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
end
json.languages @languages do |language|
  json.id language.id
  json.name language.name
end
json.filmLanguages @film_languages do |film_language|
  json.id film_language.id
  json.language film_language.language.name
end
json.genres @genres do |genre|
  json.id genre.id
  json.name genre.name
end
json.filmGenres @film_genres do |film_genre|
  json.id film_genre.id
  json.genre film_genre.genre.name
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
end
json.laurels @laurels do |laurel|
  json.id laurel.id
  json.result laurel.result
  json.awardName laurel.award_name
  json.festival laurel.festival
  json.filmId laurel.film_id
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
end
json.actors @actors do |actor|
  json.id actor.id
  json.filmId actor.film_id
  json.firstName actor.first_name
  json.lastName actor.last_name
end
json.bookings @bookings do |booking|
  json.id booking.id
  json.venue booking.venue.label
  json.startDate booking.start_date.strftime("%-m/%-d/%y")
  json.type booking.booking_type
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
json.schedule @schedule
