require 'rails_helper'
require 'support/features_helper'

describe 'amazon_languages_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:amazon_language)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all amazon languages' do
    visit setting_path(as: $admin_user)
    within('#amazon-languages-index') do
      expect(page).to have_content 'English (UK)'
    end
  end

  it 'adds amazon languages' do
    visit setting_path(as: $admin_user)
    within('#amazon-languages-index') do
      click_btn('Add Amazon Language')
    end
    info = { name: 'English (US)' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: AmazonLanguage.last,
      data: info
    )
    within('#amazon-languages-index') do
      expect(page).to have_content('English (US)')
    end
  end

  it 'validates amazon languages' do
    visit setting_path(as: $admin_user)
    within('#amazon-languages-index') do
      click_btn('Add Amazon Language')
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
