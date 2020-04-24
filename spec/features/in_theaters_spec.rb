require 'rails_helper'
require 'support/features_helper'

describe 'in_theaters', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
  end

  it 'is gated' do
    visit in_theaters_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays films in "in theaters" section' do
    create(:in_theaters_film)
    visit in_theaters_path(as: $admin_user)
    within('.in-theaters') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'adds films to "in theaters" section' do
    visit in_theaters_path(as: $admin_user)
    find('.blue-outline-button', text: 'Add Film', match: :first).click
    select_from_modal('Wilby Wonderful')
    expect(InTheatersFilm.last.section).to eq('In Theaters')
    within('.in-theaters') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'removes films from "in theaters" section' do
    create(:in_theaters_film)
    visit in_theaters_path(as: $admin_user)
    find('.x-button').click
    expect(page).to have_no_css('.spinner')
    expect(InTheatersFilm.count).to be(0)
    expect(page).to have_no_content('Wilby Wonderful')
  end

  it 'displays films in "coming soon" section' do
    create(:coming_soon_film)
    visit in_theaters_path(as: $admin_user)
    within('.coming-soon') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'adds films to "coming soon" section' do
    visit in_theaters_path(as: $admin_user)
    find_all('.blue-outline-button', text: 'Add Film')[1].click
    select_from_modal('Wilby Wonderful')
    expect(InTheatersFilm.last.section).to eq('Coming Soon')
    within('.coming-soon') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'removes films from "coming soon" section' do
    create(:coming_soon_film)
    visit in_theaters_path(as: $admin_user)
    find('.x-button').click
    expect(page).to have_no_css('.spinner')
    expect(InTheatersFilm.count).to be(0)
    expect(page).to have_no_content('Wilby Wonderful')
  end

  it 'displays films in "repertory" section' do
    create(:repertory_film)
    visit in_theaters_path(as: $admin_user)
    within('.repertory') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'adds films to "repertory" section' do
    visit in_theaters_path(as: $admin_user)
    find_all('.blue-outline-button', text: 'Add Film')[2].click
    select_from_modal('Wilby Wonderful')
    expect(InTheatersFilm.last.section).to eq('Repertory')
    within('.repertory') do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'removes films from "repertory" section' do
    create(:repertory_film)
    visit in_theaters_path(as: $admin_user)
    find('.x-button').click
    expect(page).to have_no_css('.spinner')
    expect(InTheatersFilm.count).to be(0)
    expect(page).to have_no_content('Wilby Wonderful')
  end

end
