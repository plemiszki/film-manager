require 'rails_helper'
require 'support/features_helper'

describe 'merchandise_type_details', type: :feature do

  before(:each) do
    create(:setting)
    @merchandise_type = create(:merchandise_type)
  end

  it 'is gated' do
    visit merchandise_type_path(@merchandise_type)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the merchandise_type' do
    visit merchandise_type_path(@merchandise_type, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('Shirt')
  end

  it 'updates information about the merchandise_type' do
    visit merchandise_type_path(@merchandise_type, as: $admin_user)
    new_info = {
      name: 'Poster'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @merchandise_type,
      data: new_info
    )
  end

  it 'validates information about the merchandise_type' do
    visit merchandise_type_path(@merchandise_type, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the merchandise_type' do
    visit merchandise_type_path(@merchandise_type, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(MerchandiseType.find_by_id(@merchandise_type.id)).to be(nil)
  end

end
