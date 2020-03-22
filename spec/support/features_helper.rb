RSpec.configure do |config|

  config.before(:each) do
    $admin_user = User.create!(name: 'Peter Lemiszki', email: 'peter+features@filmmovement.com', password: 'password', access: 150)
  end

end

def fill_out_form(hash)
  expect(page).not_to have_selector('.spinner')
  hash.each do |key, value|
    key = key.to_s.camelize(:lower)
    if value.class != Hash
      field = find("[data-field=\"#{key}\"]")
      field.set(value)
    elsif value[:type] != :select
      field = find("[data-field=\"#{key}\"]")
      field.set(value[:value])
    elsif value[:type] == :select
      value = value[:value]
      field = find("select[data-field=#{key}]", visible: false)
      nice_select_div = field.sibling('.nice-select')
      nice_select_div.click
      sleep 0.25
      find("li[data-value='#{value}']").click
    end
  end
end

def save_and_wait
  save_button = find('.orange-button', text: 'Save')
  save_button.click
  expect(page).not_to have_selector('.spinner')
end

def fill_out_and_submit_modal(data, button_type)
  expect(page).not_to have_selector('.spinner')
  data.each do |key, value|
    key = key.to_s.camelize(:lower)
    within('.admin-modal') do
      find("input[data-field=#{key}]").set(value)
    end
  end
  within('.admin-modal') do
    if button_type == :input
      find('input.btn').click
    elsif button_type == :orange_button
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

def change_modal_select_field(id, selection_text)
  input = find("input[data-field=\"#{id}\"]")
  column_div = input.find(:xpath, '..')
  next_column_div = column_div.sibling('.col-xs-1')
  within(next_column_div) { find('img').click }
  within('.ReactModalPortal') do
    find('li', text: selection_text).click
  end
end
