require 'rails_helper'
require 'support/features_helper'

describe 'format_details', type: :feature do

  before(:each) do
    create(:setting)
    @format = create(:format)
  end

  it 'is gated' do
    visit format_path(@format)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the format' do
    visit format_path(@format, as: $admin_user)
    expect(find('input[data-field="name"]').value).to eq('35mm')
  end

  it 'updates information about the format' do
    visit format_path(@format, as: $admin_user)
    new_info = {
      name: 'Digibeta'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @format,
      data: new_info
    })
  end

  it 'validates information about the format' do
    visit format_path(@format, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the format' do
    visit format_path(@format, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Format.find_by_id(@format.id)).to be(nil)
  end

end
