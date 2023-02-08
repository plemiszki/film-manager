require 'rails_helper'
require 'support/features_helper'

describe 'genres_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:genre)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all genres' do
    visit setting_path(as: $admin_user)
    within('#genres-index') do
      expect(page).to have_content 'Comedy'
    end
  end

  it 'adds genres' do
    visit setting_path(as: $admin_user)
    within('#genres-index') do
      click_btn("Add Genre")
    end
    info = { name: 'Drama' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Genre.last,
      data: info
    )
    within('#genres-index') do
      expect(page).to have_content('Drama')
    end
  end

  it 'validates genres' do
    visit setting_path(as: $admin_user)
    within('#genres-index') do
      click_btn("Add Genre")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
