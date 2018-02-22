json.weeklyTerms @weekly_terms do |weekly_term|
  json.id weekly_term.id
  json.terms weekly_term.terms
  json.order weekly_term.order
end
