require 'rails_helper'
require 'support/features_helper'

describe 'calendar', type: :feature do

  before(:each) do
    create(:label)
  end

  it 'is not gated' do
    visit calendar_path
    expect(page).to have_no_content 'Please sign in to continue.'
  end

  it 'displays nav bar when signed in' do
    visit calendar_path(as: $admin_user)
    expect(page).to have_selector '#admin-sidebar'
  end

  it 'displays the current year' do
    visit calendar_path(as: $admin_user)
    expect(page).to have_content(Date.today.year)
  end

  it 'advances to the next year' do
    visit calendar_path(as: $admin_user)
    find('.orange-button', text: '>>').click
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content(Date.today.year + 1)
  end

  it 'moves back to the previous year' do
    visit calendar_path(as: $admin_user)
    find('.orange-button', text: '<<').click
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content(Date.today.year - 1)
  end

  it 'displays theatrical releases' do
    create(:film, theatrical_release: Date.parse("1/1/#{Date.today.year}"))
    visit calendar_path(as: $admin_user)
    within all('td[data-test="theatrical"]')[0] do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'displays tvod/est releases' do
    create(:film, tvod_release: Date.parse("1/1/#{Date.today.year}"))
    visit calendar_path(as: $admin_user)
    within all('td[data-test="tvod"]')[0] do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'displays club releases' do
    create(:film, club_date: Date.parse("1/1/#{Date.today.year}"))
    visit calendar_path(as: $admin_user)
    within all('td[data-test="club"]')[0] do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'displays FM+ releases' do
    create(:film, fm_plus_release: Date.parse("1/1/#{Date.today.year}"))
    visit calendar_path(as: $admin_user)
    within all('td[data-test="fm-plus"]')[0] do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

  it 'displays dvd releases' do
    create(:film)
    create(:dvd, retail_date: Date.parse("1/1/#{Date.today.year}"))
    visit calendar_path(as: $admin_user)
    within all('td[data-test="dvd"]')[0] do
      expect(page).to have_content('Wilby Wonderful')
    end
  end

end
