require 'rails_helper'
require 'support/features_helper'

describe 'topics_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:topic)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all topics' do
    visit setting_path(as: $admin_user)
    within('#topics-index') do
      expect(page).to have_content 'Latino'
    end
  end

  it 'adds topics' do
    visit setting_path(as: $admin_user)
    within('#topics-index') do
      click_btn("Add Topic")
    end
    info = { name: 'LGBT' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Topic.last,
      data: info
    )
    within('#topics-index') do
      expect(page).to have_content('LGBT')
    end
  end

  it 'validates topics' do
    visit setting_path(as: $admin_user)
    within('#topics-index') do
      click_btn("Add Topic")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
