require 'rails_helper'
require 'support/features_helper'

describe 'films_index', type: :feature do

  before(:all) {
    Film.create!(title: 'Wilby Wonderful', label_id: 1, year: 2002, length: 90, film_type: 'Feature')
    Film.create!(title: '12 Years', label_id: 1, year: 2002, length: 5, film_type: 'Short')
    Film.create!(title: 'The Adventures of Pete and Pete', label_id: 1, year: 1990, length: 200, film_type: 'TV Series')
  }

  it 'is gated' do
    visit films_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all feature films' do
    visit films_path(as: $admin_user)
    expect(page).to have_content 'Features'
    expect(page).to have_content 'Wilby Wonderful'
  end

  it 'can add new feature films' do
    visit films_path(as: $admin_user)
    find('.orange-button', text: 'Add Film').click
    find('[data-field="title"]').set('New Film')
    find('[data-field="year"]').set('2002')
    find('[data-field="length"]').set('90')
    within('.admin-modal') do
      find('.orange-button', text: 'Add Film').click
    end
    expect(find('.fm-admin-table')).to have_content 'New Film'
    expect(Film.last.attributes).to include(
      'title' => 'New Film',
      'length' => 90,
      'year' => 2002,
      'film_type' => 'Feature'
    )
  end

  it 'validates new films properly' do
    visit films_path(as: $admin_user)
    find('.orange-button', text: 'Add Film').click
    within('.admin-modal') do
      find('.orange-button', text: 'Add Film').click
    end
    expect(page).to have_content "Title can't be blank"
    expect(page).to have_content 'Year is not a number'
    expect(page).to have_content 'Length is not a number'
  end

  it 'displays all short films' do
    visit shorts_path(as: $admin_user)
    expect(page).to have_content 'Shorts'
    expect(page).to have_content '12 Years'
  end

  it 'can add new short films' do
    visit shorts_path(as: $admin_user)
    find('.orange-button', text: 'Add Short').click
    find('[data-field="title"]').set('New Short')
    find('[data-field="year"]').set('2002')
    find('[data-field="length"]').set('5')
    within('.admin-modal') do
      find('.orange-button', text: 'Add Short').click
    end
    expect(find('.fm-admin-table')).to have_content 'New Short'
    expect(Film.last.attributes).to include(
      'title' => 'New Short',
      'length' => 5,
      'year' => 2002,
      'film_type' => 'Short'
    )
  end

  it 'displays all tv series' do
    visit tv_series_index_path(as: $admin_user)
    expect(page).to have_content 'TV Series'
    expect(page).to have_content 'The Adventures of Pete and Pete'
  end

  it 'can add new tv series' do
    visit tv_series_index_path(as: $admin_user)
    find('.orange-button', text: 'Add TV Series').click
    find('[data-field="title"]').set('New TV Series')
    find('[data-field="year"]').set('2005')
    find('[data-field="length"]').set('200')
    within('.admin-modal') do
      find('.orange-button', text: 'Add TV Series').click
    end
    expect(find('.fm-admin-table')).to have_content 'New TV Series'
    expect(Film.last.attributes).to include(
      'title' => 'New TV Series',
      'length' => 200,
      'year' => 2005,
      'film_type' => 'TV Series'
    )
  end

end
