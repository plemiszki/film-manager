require 'rails_helper'
require 'support/features_helper'

describe 'merchandise_types_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:merchandise_type)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all merchandise_types' do
    visit setting_path(as: $admin_user)
    within('#merchandise-types-index') do
      expect(page).to have_content 'Shirt'
    end
  end

  it 'adds merchandise_types' do
    visit setting_path(as: $admin_user)
    within('#merchandise-types-index') do
      click_btn("Add Merchandise Type")
    end
    info = { name: 'Poster' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: MerchandiseType.last,
      data: info
    )
    within('#merchandise-types-index') do
      expect(page).to have_content('Poster')
    end
  end

  it 'validates merchandise_types' do
    visit setting_path(as: $admin_user)
    within('#merchandise-types-index') do
      click_btn("Add Merchandise Type")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
