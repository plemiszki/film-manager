require 'rails_helper'
require 'support/features_helper'

describe 'institutions_index', type: :feature do

  before(:each) do
    create(:institution)
  end

  it 'is gated' do
    visit institutions_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all institutions' do
    visit institutions_path(as: $admin_user)
    within('#institutions-index') do
      expect(page).to have_content 'Harvard University'
    end
  end

  it 'adds institutions' do
    visit institutions_path(as: $admin_user)
    within('#institutions-index') do
      click_btn("Add Institution")
    end
    info = { label: 'Columbia University' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Institution.last,
      data: info,
    )
    within('#institutions-index') do
      expect(page).to have_content('Columbia University')
    end
  end

  it 'validates institutions' do
    visit institutions_path(as: $admin_user)
    within('#institutions-index') do
      click_btn("Add Institution")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Label can't be blank")
  end

end
