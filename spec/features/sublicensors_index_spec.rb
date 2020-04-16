require 'rails_helper'
require 'support/features_helper'

describe 'sublicensors_index', type: :feature do

  before :each do
    create(:sublicensor)
  end

  it 'is gated' do
    visit sublicensors_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all sublicensors' do
    visit sublicensors_path(as: $admin_user)
    expect(page).to have_content 'Kanopy'
  end

  it 'adds new sublicensors' do
    visit sublicensors_path(as: $admin_user)
    find('.btn', text: 'Add Sublicensor').click
    info = {
      name: 'Fandor'
    }
    fill_out_and_submit_modal(info, :input)
    verify_db({
      entity: Sublicensor.last,
      data: info
    })
    expect(page).to have_content 'Fandor'
  end

  it 'validates new sublicensors' do
    visit sublicensors_path(as: $admin_user)
    find('.btn', text: 'Add Sublicensor').click
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content "Name can't be blank"
  end

end
