require 'rails_helper'
require 'support/features_helper'

describe 'languages_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:language)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all languages' do
    visit setting_path(as: $admin_user)
    within('#languages-index') do
      expect(page).to have_content 'French'
    end
  end

  it 'adds languages' do
    visit setting_path(as: $admin_user)
    within('#languages-index') do
      find('.btn', text: 'Add Language').click
    end
    info = { name: 'Spanish' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Language.last,
      data: info
    )
    within('#languages-index') do
      expect(page).to have_content('Spanish')
    end
  end

  it 'validates languages' do
    visit setting_path(as: $admin_user)
    within('#languages-index') do
      find('.btn', text: 'Add Language').click
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
