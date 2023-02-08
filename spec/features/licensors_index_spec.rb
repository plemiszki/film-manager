require 'rails_helper'
require 'support/features_helper'

describe 'licensors_index', type: :feature do

  before(:each) do
    Licensor.create!(name: 'Visit Films', email: 'ryan@visitfilms.com')
  end

  it 'is gated' do
    visit licensors_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all licensors' do
    visit licensors_path(as: $admin_user)
    expect(page).to have_content 'Licensors'
    expect(page).to have_content 'Visit Films'
  end

  it 'adds new licensors' do
    visit licensors_path(as: $admin_user)
    click_btn("Add Licensor")
    fill_out_and_submit_modal({
      name: 'New Licensor',
    }, :input)
    expect(Licensor.last.attributes).to include(
      'name' => 'New Licensor'
    )
    expect(page).to have_current_path("/licensors/#{Licensor.last.id}", ignore_query: true)
  end

  it 'validates new licensors properly' do
    visit licensors_path(as: $admin_user)
    click_btn("Add Licensor")
    within('.admin-modal') do
      click_btn("Add Licensor", :submit)
    end
    expect(page).to have_content "Name can't be blank"
  end

end
