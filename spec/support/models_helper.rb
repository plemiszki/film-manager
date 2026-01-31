def test_parse_all_date_fields(resource)
  fields = resource.attributes.keys
  date_fields = fields.select do |field|
    field_info = resource.type_for_attribute(field)
    field_info.type == :date && !resource.send(field).is_a?(Array) # TODO: validate array columns
  end
  obj = {}

  # test date range validation works properly
  date_fields.each do |field|
    obj[field] = "1/1/2051"
  end
  resource.update(obj)
  date_fields.each_with_index do |field, index|
    expect(resource.errors.messages[field.to_sym]).to include("is out of range")
  end

  # test parsing works properly
  # sort so start_date comes before end_date to avoid validation errors
  sorted_fields = date_fields.sort_by { |f| f.include?('start') ? 0 : (f.include?('end') ? 2 : 1) }
  sorted_fields.each_with_index do |field, index|
    obj[field] = "2/#{index + 1}/20"
  end
  resource.update(obj)
  sorted_fields.each_with_index do |field, index|
    expect(resource.send(field).month).to eq(2)
    expect(resource.send(field).day).to eq(index + 1)
    expect(resource.send(field).year).to eq(2020)
    expect(resource.errors.messages[field.to_sym]).to match_array([])
  end

end
