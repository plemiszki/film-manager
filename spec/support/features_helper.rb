RSpec.configure do |config|

  config.before(:each) do
    $admin_user = User.create!(name: 'Peter Lemiszki', email: 'peter+features@filmmovement.com', password: 'password', access: 150)
  end

end

def fill_out_form(hash)
  expect(page).not_to have_selector('.spinner')
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

def save_and_wait
  save_button = find('.orange-button', text: 'Save')
  save_button.click
  expect(page).not_to have_selector('.spinner')
  expect(save_button.text).to eq('Saved')
end

def fill_out_and_submit_modal(data)
  expect(page).not_to have_selector('.spinner')
  data.each do |key, value|
    key = key.to_s.camelize(:lower)
    within('.admin-modal') do
      find("input[data-field=#{key}]").set(value)
    end
  end
  within('.admin-modal') do
    if has_css?('input.btn')
      find('input.btn').click
    else
      find('.orange-button').click
    end
  end
  expect(page).not_to have_selector('.spinner')
end

def select_from_modal(option)
  within('.modal-select') do
    find('li', text: option).click
  end
  expect(page).not_to have_selector('.spinner')
end
