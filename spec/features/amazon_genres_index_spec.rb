require 'rails_helper'
require 'support/features_helper'

describe 'amazon_genres_index', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    create(:setting)
    create(:amazon_genre)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all amazon genres' do
    visit setting_path(as: $admin_user)
    within('#amazon-genres-index') do
      expect(page).to have_content 'av_genre_action'
    end
  end

  it 'adds amazon genres' do
    visit setting_path(as: $admin_user)
    within('#amazon-genres-index') do
      click_btn('Add Amazon Genre')
    end
    info = {
      code: 'av_genre_arthouse',
    }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: AmazonGenre.last,
      data: info
    )
    within('#amazon-genres-index') do
      expect(page).to have_content('av_genre_arthouse')
    end
  end

  it 'validates amazon genres' do
    visit setting_path(as: $admin_user)
    within('#amazon-genres-index') do
      click_btn('Add Amazon Genre')
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Code can't be blank")
  end

end
