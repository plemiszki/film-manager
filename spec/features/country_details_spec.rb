require 'rails_helper'
require 'support/features_helper'

describe 'country_details', type: :feature do

  before(:each) do
    create(:setting)
    @country = create(:country)
  end

  it 'is gated' do
    visit country_path(@country)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays incountryion about the country' do
    visit country_path(@country, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('France')
  end

  it 'updates incountryion about the country' do
    visit country_path(@country, as: $admin_user)
    new_info = {
      name: 'Spain'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @country,
      data: new_info,
    )
  end

  it 'validates information about the country' do
    visit country_path(@country, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the country' do
    visit country_path(@country, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Country.find_by_id(@country.id)).to be(nil)
  end

end
