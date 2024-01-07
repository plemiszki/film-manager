json.institutionOrderFormats @institution_order_formats do |institution_order_format|
  json.id institution_order_format.id
  json.formatName institution_order_format.format.name
end
json.formats @formats do |format|
  json.id format.id
  json.name format.name
end
