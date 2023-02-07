RSpec.configure do |config|

  config.before(:each) do
    $admin_user = create(:user, email: 'peter+features@filmmovement.com', has_auto_renew_approval: true)
  end

end

def create_dvd_types
  DvdType.create!(name: 'Retail')
  DvdType.create!(name: 'Club')
end

def list_box_selector(text)
  "ul[data-test=#{text}]"
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
    elsif value[:type] == :switch
      field = find("[data-field=\"#{key}\"]", visible: false)
      oval_div = field.sibling('.oval')
      oval_div.click unless field.checked? == value[:value]
    elsif value[:type] == :select_modal
      field = find("[data-field=\"#{key}\"]")
      div_index = field.path.split('/')[-2].match(/DIV\[(?<index>\d)\]/)[:index].to_i
      icon_div = field.find(:xpath, "../../DIV[#{div_index + 1}]")
      icon_div.click
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
    elsif value[:type]
      raise "field type \"#{value[:type]}\" not recognized"
    else
      field = find("[data-field=\"#{key}\"]")
      field.set(value[:value])
    end
  end
end

def verify_db_and_component(entity:, data:, db_data: {}, component_data: {})
  db_data = data.merge(db_data)
  component_data = data.merge(component_data)
  verify_db(entity: entity, data: db_data)
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

def click_btn(text, type = :link)
  if type == :link
    find('a', text: /\A#{text}\z/).click
  elsif :submit
    click_on text
  end
end

def click_table_button(text)
  find("table div.custom-button", text: text).click
end

def flip_switch(text)
  find("div.oval[data-test=\"#{text}\"]").click
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
  save_button = find('a', text: /^Save$/)
  save_button.click
  expect(page).not_to have_selector('.spinner')
end

def click_delete_and_confirm
  delete_button = find('a', text: /^Delete$/)
  delete_button.click
  click_confirm_delete
end

def click_confirm_delete
  within('.confirm-delete') do
    find('a', text: /^Yes$/).click
  end
end

def confirm
  within('.confirm-modal') do
    click_btn('Yes')
  end
end

def click_index_add_button
  find('a', text: /^Add #{@entity_name.capitalize}$/).click
end

def fill_out_and_submit_modal(data, button_type)
  within('.admin-modal') do
    fill_out_form(data)
    if button_type == :input
      find('input[type="submit"]').click
    else
      find('a').click
    end
  end
  expect(page).not_to have_selector('.spinner')
end

def search_index(criteria)
  expect(page).not_to have_selector('.spinner')
  find('.search-button').click
  criteria.each do |key, value|
    key = key.to_s.camelize(:lower)
    field = find("div[data-test-field=#{key}]")
    within(field) do
      checkbox = find('input[type="checkbox"]', visible: false)
      unless checkbox.checked?
        switch = find('.oval')
        switch.click
      end
      case value[:type]
      when :select_modal
        find('.select-from-modal').click
        select_from_modal(value[:value])
      when :select
        select_element = find("select", visible: false)
        nice_select_div = select_element.sibling('.nice-select')
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
      when :date_range
        start_field = find("input.min", visible: false)
        start_field.set(value[:start])
        end_field = find("input.max", visible: false)
        start_field.set(value[:end])
      when :number_range
        start_field = find("input.min", visible: false)
        start_field.set(value[:start])
        end_field = find("input.max", visible: false)
        end_field.set(value[:end])
      when :checkboxes
        within('.checkboxes-container') do
          value[:labels].each do |label|
            find("label", text: label).click
          end
        end
      else
        input_element = find("input.test-input-field", visible: false)
        input_element.set(value[:value])
      end
    end
  end
  click_btn('Search', :input)
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

def create_revenue_streams
  [
    'Theatrical',
    'Non-Theatrical',
    'Video',
    'Commercial Video',
    'VOD',
    'SVOD',
    'TVOD',
    'AVOD',
    'FVOD',
    'Other Internet',
    'Hotels, Ships, Airlines',
    'Television',
    'FM Subscription',
    'Jewish Festivals'
  ].each_with_index do |name, index|
    create(:revenue_stream, name: name, order: index)
  end
end

private

def get_value(value)
  value.class == Hash ? value[:value] : value
end
