require 'rails_helper'
require 'support/features_helper'

describe 'territory_details', type: :feature do

  before(:each) do
    create(:setting)
    @territory = create(:territory)
  end

  it 'is gated' do
    visit territory_path(@territory)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the territory' do
    visit territory_path(@territory, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('USA')
  end

  it 'updates information about the territory' do
    visit territory_path(@territory, as: $admin_user)
    new_info = {
      name: 'Canada'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @territory,
      data: new_info
    )
  end

  it 'validates information about the territory' do
    visit territory_path(@territory, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the territory' do
    visit territory_path(@territory, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Territory.find_by_id(@territory.id)).to be(nil)
  end

end
