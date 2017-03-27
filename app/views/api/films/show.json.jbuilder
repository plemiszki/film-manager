json.array! @films do |film|
  json.id film.id
  json.title film.title
  json.shortFilm film.short_film == true ? "yes" : "no"
  json.licensorId film.licensor_id || ""
  json.dealTypeId film.deal_type_id.to_s
  json.daysStatementDue film.days_statement_due.to_s
  json.grPercentage film.gr_percentage.to_s || ""
  json.expenseCap film.expense_cap || ""
  json.mg film.mg || ""
  json.eAndO film.e_and_o || ""
  json.sageId film.sage_id || ""
  json.royaltyNotes film.royalty_notes || ""
end
