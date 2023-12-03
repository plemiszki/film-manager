json.films @films do |film|
  json.id film.id
  json.title film.title
  json.endDate film.end_date ? film.end_date.strftime("%-m/%-d/%Y") : ""
  json.autoRenewTerm film.auto_renew_term
  json.autoRenewDaysNotice film.auto_renew_days_notice
end
