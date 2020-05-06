RSpec.configure do |config|

  config.before(:each) do
    $admin_user = create(:user, email: 'peter+features@filmmovement.com')
  end

end

def create_dvd_types
  DvdType.create!(name: 'Retail')
  DvdType.create!(name: 'Club')
end

def clear_form(except: nil)
  expect(page).not_to have_selector('.spinner')
  inputs = page.all("input[data-field], textarea[data-field]")
  inputs.each do |input|
    next if input[:type] == 'checkbox' || input[:readonly] == 'true'
    next if except.present? && except.include?(input['data-field'])
    input.set('')
  end
end

def fill_out_form(data)
  expect(page).not_to have_selector('.spinner')
  data.each do |key, value|
    key = key.to_s.camelize(:lower)
    if value.class != Hash
      field = find("[data-field=\"#{key}\"]")
      field.set(value)
    elsif value[:type] == :select_modal
      field = find("[data-field=\"#{key}\"]")
      parent_div = field.find(:xpath, '..')
      next_div = parent_div.sibling('.col-xs-1')
      next_div.click
      select_from_modal(value[:value])
    elsif value[:type] == :select_modal_old
      field = find("[data-field=\"#{key}\"]")
      parent_div = field.find(:xpath, '..')
      next_div = parent_div.sibling('.col-xs-1')
      within(next_div) do
        img = find('img')
        img.click
      end
      select_from_modal(value[:value])
    elsif value[:type] == :select
      field = find("select[data-field=#{key}]", visible: false)
      nice_select_div = field.sibling('.nice-select')
      nice_select_div.click
      sleep 0.25
      within(nice_select_div) do
        if value[:value]
          find("li[data-value='#{value[:value]}']").click
        elsif value[:label]
          find('li', text: value[:label]).click
        else
          raise 'missing value or label attribute!'
        end
      end
    else
      field = find("[data-field=\"#{key}\"]")
      field.set(value[:value])
    end
  end
end

def verify_db_and_component(entity:, data:, db_data: {}, component_data: {})
  db_data = data.merge(db_data)
  component_data = data.merge(component_data)
  verify_db({ entity: entity, data: db_data })
  component_data.each do |key, value|
    field = find("[data-field=\"#{key.to_s.camelize(:lower)}\"]", visible: :all)
    if field['type'] == 'checkbox'
      expect(field.checked?).to eq get_value(value)
    else
      expect(field.value).to eq get_value(value).to_s
    end
  end
end

def verify_db(entity:, data:)
  arrow_syntax = data.map { |key, value| [key.to_s, get_value(value)] }.to_h
  expect(entity.reload.attributes).to include(arrow_syntax)
end

def click_nice_select_option(css_selector, option_text)
  field = find(css_selector, visible: false)
  nice_select_div = field.sibling('.nice-select')
  nice_select_div.click
  sleep 0.25
  find('li', text: option_text).click
end

def save_and_wait
  expect(page).not_to have_selector('.spinner')
  save_button = find('.orange-button, .btn', text: /^Save$/)
  save_button.click
  expect(page).not_to have_selector('.spinner')
end

def fill_out_and_submit_modal(data, button_type)
  within('.admin-modal') do
    fill_out_form(data)
    if button_type == :input
      find('input.btn').click
    elsif button_type == :orange_button
      find('.orange-button').click
    end
  end
  expect(page).not_to have_selector('.spinner')
end

def select_from_modal(option)
  modal_select = page.document.find('.modal-select')
  within(modal_select) do
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

def wait_for_ajax
  expect(page).to have_no_css('.spinner')
end

def get_proper_quarter(date)
  month = date.month
  year = date.year
  month -= 2
  if month < 1
    year -= 1
    month += 12
  end
  return [quarter(month), year]
end

def quarter(month)
  (month + 2) / 3
end

def dollarify(input)
  input << '0' if input.split('.')[1].length < 2
  if (input[0] == '-')
    '-$' + input[1..-1]
  else
    '$' + input
  end
end

private

def get_value(value)
  value.class == Hash ? value[:value] : value
end
