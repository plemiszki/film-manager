require 'rails_helper'
require 'support/features_helper'

describe 'digital_retailers_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:digital_retailer)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all digital retailers' do
    visit setting_path(as: $admin_user)
    within('#digital-retailers-index') do
      expect(page).to have_content 'iTunes'
    end
  end

  it 'adds digital retailers' do
    visit setting_path(as: $admin_user)
    within('#digital-retailers-index') do
      find('.btn', text: 'Add Digital Retailer').click
    end
    info = { name: 'Kanopy' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: DigitalRetailer.last,
      data: info
    )
    within('#digital-retailers-index') do
      expect(page).to have_content('Kanopy')
    end
  end

  it 'validates digital retailers' do
    visit setting_path(as: $admin_user)
    within('#digital-retailers-index') do
      find('.btn', text: 'Add Digital Retailer').click
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
