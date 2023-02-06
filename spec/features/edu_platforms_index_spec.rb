require 'rails_helper'
require 'support/features_helper'

describe 'edu_platforms_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:edu_platform)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all educational platforms' do
    visit setting_path(as: $admin_user)
    within('#edu-platforms-index') do
      expect(page).to have_content 'Kanopy'
    end
  end

  it 'adds educational platforms' do
    visit setting_path(as: $admin_user)
    within('#edu-platforms-index') do
      click_btn("Add Edu Platform")
    end
    info = { name: 'Test' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: EduPlatform.last,
      data: info
    )
    within('#edu-platforms-index') do
      expect(page).to have_content('Test')
    end
  end

  it 'validates educational platforms' do
    visit setting_path(as: $admin_user)
    within('#edu-platforms-index') do
      click_btn("Add Edu Platform")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
