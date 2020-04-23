require 'rails_helper'
require 'support/features_helper'

describe 'countries_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:country)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all countries' do
    visit setting_path(as: $admin_user)
    within('#countries-index') do
      expect(page).to have_content 'France'
    end
  end

  it 'adds countries' do
    visit setting_path(as: $admin_user)
    within('#countries-index') do
      find('.btn', text: 'Add Country').click
    end
    info = { name: 'Spain' }
    fill_out_and_submit_modal(info, :input)
    verify_db({
      entity: Country.last,
      data: info
    })
    within('#countries-index') do
      expect(page).to have_content('Spain')
    end
  end

  it 'validates countries' do
    visit setting_path(as: $admin_user)
    within('#countries-index') do
      find('.btn', text: 'Add Country').click
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
