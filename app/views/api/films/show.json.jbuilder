json.films @films do |film|
  json.id film.id
  json.title film.title
  json.shortFilm film.short_film == true ? "yes" : "no"
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
  json.sellOffPeriod film.sell_off_period
  json.autoRenew film.auto_renew
  json.autoRenewTerm film.auto_renew_term
  json.year film.year.to_s || ""
  json.length film.length.to_s || ""
  json.director film.director
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
  json.value right.value
end
json.dvds @dvds do |dvd|
  json.id dvd.id
  json.type dvd.dvd_type.name
end
json.dvdTypes @dvd_types do |dvd_type|
  json.id dvd_type.id
  json.name dvd_type.name
end
