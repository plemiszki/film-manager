require 'rails_helper'
require 'support/features_helper'

describe 'films_index', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    create(:label)
    Film.create!(title: 'Wilby Wonderful', label_id: 1, year: 2002, length: 90, film_type: 'Feature')
    Film.create!(title: '12 Years', label_id: 1, year: 2002, length: 5, film_type: 'Short')
    Film.create!(title: 'The Adventures of Pete and Pete', label_id: 1, year: 1990, length: 200, film_type: 'TV Series')
  end

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
    info = {
      title: 'New Film',
      year: 2002,
      length: 90
    }
    click_btn('Add Film')
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_current_path "/films/#{Film.last.id}", ignore_query: true
    verify_db(
      entity: Film.last,
      data: info.merge({ film_type: 'Feature' })
    )
  end

  it 'validates new films properly' do
    visit films_path(as: $admin_user)
    click_btn('Add Film')
    fill_out_and_submit_modal({}, :input)
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
    wait_for_ajax
    click_btn('Add Short')
    info = {
      title: 'New Short',
      year: 2002,
      length: 5
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_current_path "/films/#{Film.last.id}", ignore_query: true
    verify_db(
      entity: Film.last,
      data: info.merge({ film_type: 'Short' })
    )
  end

  it 'displays all tv series' do
    visit tv_series_index_path(as: $admin_user)
    expect(page).to have_content 'TV Series'
    expect(page).to have_content 'The Adventures of Pete and Pete'
  end

  it 'can add new tv series' do
    visit tv_series_index_path(as: $admin_user)
    wait_for_ajax
    click_btn('Add TV Series')
    info = {
      title: 'New TV Series',
      year: 2005,
      length: 200
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_current_path "/films/#{Film.last.id}", ignore_query: true
    verify_db(
      entity: Film.last,
      data: info.merge({ film_type: 'TV Series' })
    )
  end

  it 'starts the export all job' do
    visit films_path(as: $admin_user)
    click_btn('Export All')
    expect(page).to have_content('Exporting Metadata')
  end

  it 'starts the export custom job' do
    create(:right)
    create(:territory)
    visit films_path(as: $admin_user)
    click_btn('Export Custom')
    within('.admin-modal') do
      find('[data-field="startDate"').set('1/1/2000')
      find('[data-field="endDate"').set('1/1/2000')
      find('label', text: 'USA').click
      find('a', text: 'ALL', match: :first).click
      click_btn('Search')
    end
    expect(page).to have_content('Exporting Metadata')
  end

end
