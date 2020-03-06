RSpec.configure do |config|

  config.before(:suite) do
    $admin_user = User.create!(name: 'Peter Lemiszki', email: 'peter+features@filmmovement.com', password: 'password', access: 150)
  end

end

def fill_out_form(hash)
  hash.each do |key, value|
    key = key.to_s.camelize(:lower)
    if page.has_css?("input[data-field=#{key}]")
      field = find("input[data-field=#{key}]")
    else
      field = find("textarea[data-field=#{key}]")
    end
    field.set(value)
  end
end
