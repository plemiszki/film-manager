require 'rails_helper'
require 'support/features_helper'

describe 'auto_renew', type: :feature do

  before(:each) do
    create(:label)
    create(:licensor)
    @film = create(:film,
      title: 'Test 1',
      licensor_id: 1,
      auto_renew: true,
      end_date: Date.today - 90.days,
      auto_renew_days_notice: 90,
      auto_renew_term: 24,
    )
    @film_2 = create(:film,
      title: 'Test 2',
      licensor_id: 1,
      auto_renew: true,
      end_date: Date.today - 90.days,
      auto_renew_days_notice: 90,
      auto_renew_term: 12,
    )
  end

  it 'does not display the icon for users without approval' do
    visit films_path(as: create(:user, email: 'peter@filmmovement.com'))
    expect(page).not_to have_selector('.icon')
  end

  it 'displays the icon for users with approval' do
    visit films_path(as: $admin_user)
    expect(page).to have_selector('.icon')
  end

  it 'displays the film titles in the modal' do
    visit films_path(as: $admin_user)
    find('.icon').click
    expect(find('table.auto-renew-films')).to have_content('Test 1')
    expect(find('table.auto-renew-films')).to have_content('Test 2')
  end

  it 'renews a film' do
    visit films_path(as: $admin_user)
    find('.icon').click
    within('table.auto-renew-films') do
      find('a', text: 'Renew', match: :first).click
    end
    wait_for_ajax
    expect(find('table.auto-renew-films')).not_to have_content('Test 1')
    expect(@film.reload.end_date).to eq(Date.today - 90.days + 2.years)
    expect(find('table.auto-renew-films')).to have_content('Test 2')
  end

  it 'renews all films' do
    visit films_path(as: $admin_user)
    find('.icon').click
    find('a', text: 'Renew All').click
    wait_for_ajax
    expect(find('table.auto-renew-films')).not_to have_content('Test 1')
    expect(@film.reload.end_date).to eq(Date.today - 90.days + 2.years)
    expect(find('table.auto-renew-films')).not_to have_content('Test 2')
    expect(@film_2.reload.end_date).to eq(Date.today - 90.days + 1.year)
  end

end
