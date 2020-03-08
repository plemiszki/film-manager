require 'rails_helper'
require 'support/features_helper'

describe 'film_details', type: :feature do

  before(:each) do
    create(:label)
    DvdType.create!(name: 'Retail')
    @film = create(:film,
      title: 'Some Film',
      club_date: '11/1/2002',
      theatrical_release: '12/1/2002',
      svod_release: '1/1/2003',
      tvod_release: '2/1/2003',
      avod_release: '3/1/2003',
      synopsis: 'Synopsis',
      vod_synopsis: 'VOD Synopsis',
      short_synopsis: 'Short Synopsis',
      logline: 'Logline',
      institutional_synopsis: 'Institutional Synopsis'
    )
    Director.create!(film_id: @film.id, first_name: 'Rob', last_name: 'Reiner')
    Country.create!(name: 'Canada')
    Country.create!(name: 'Belize')
    FilmCountry.create!(film_id: @film.id, country_id: 1)
    Language.create!(name: 'French')
    Language.create!(name: 'Spanish')
    FilmLanguage.create!(film_id: @film.id, language_id: 1)
    Actor.create!(actorable_id: @film.id, actorable_type: 'Film', first_name: 'Brad', last_name: 'Pitt', order: 0)
  end

  it 'is gated' do
    visit film_path(@film)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays general information about the film' do
    visit film_path(@film, as: $admin_user)
    expect(find('input[data-field="title"]').value).to eq 'Some Film'
    expect(find('.directors-list')).to have_content('Rob Reiner')
    expect(find('select[data-field="labelId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="year"]').value).to eq '2002'
    expect(find('input[data-field="length"]').value).to eq '90'
    expect(find('.countries-list')).to have_content('Canada')
    expect(find('.languages-list')).to have_content('French')
    expect(find('.actors-list')).to have_content('Brad Pitt')
    expect(find('input[data-field="clubDate"]').value).to eq '11/1/02'
    expect(find('input[data-field="theatricalRelease"]').value).to eq '12/1/02'
    expect(find('input[data-field="svodRelease"]').value).to eq '1/1/03'
    expect(find('input[data-field="tvodRelease"]').value).to eq '2/1/03'
    expect(find('input[data-field="avodRelease"]').value).to eq '3/1/03'
  end

  it 'updates general information about the film' do
    visit film_path(@film, as: $admin_user)
    fill_out_form({
      title: 'New Title',
      year: '1999',
      length: '120',
      club_date: '11/1/2020',
      theatrical_release: '12/1/2020',
      svod_release: '1/1/2021',
      avod_release: '2/1/2021',
      tvod_release: '3/1/2021'
    })
    save_and_wait
    expect(@film.reload.attributes).to include(
      'title' => 'New Title',
      'year' => 1999,
      'length' => 120,
      'club_date' => Date.parse('1/11/2020'),
      'theatrical_release' => Date.parse('1/12/2020'),
      'svod_release' => Date.parse('1/1/2021'),
      'avod_release' => Date.parse('1/2/2021'),
      'tvod_release' => Date.parse('1/3/2021')
    )
  end

  it 'adds directors' do
    visit film_path(@film, as: $admin_user)
    find('.blue-outline-button', text: 'Add Director').click
    fill_out_and_submit_modal({
      first_name: 'Johnny',
      last_name: 'Depp'
    })
    expect(Director.last.attributes).to include(
      'first_name' => 'Johnny',
      'last_name' => 'Depp'
    )
  end

  it 'removes directors' do
    visit film_path(@film, as: $admin_user)
    within('.directors-list') do
      find('.x-button').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(Director.count).to eq(0)
  end

  it 'adds countries' do
    visit film_path(@film, as: $admin_user)
    find('.blue-outline-button', text: 'Add Country').click
    select_from_modal('Belize')
    expect(FilmCountry.last.country.attributes).to include(
      'name' => 'Belize'
    )
  end

  it 'removes countries' do
    visit film_path(@film, as: $admin_user)
    within('.countries-list') do
      find('.x-button').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(FilmCountry.count).to eq(0)
  end

  it 'adds languages' do
    visit film_path(@film, as: $admin_user)
    find('.blue-outline-button', text: 'Add Language').click
    select_from_modal('Spanish')
    expect(FilmLanguage.last.language.attributes).to include(
      'name' => 'Spanish'
    )
  end

  it 'removes languages' do
    visit film_path(@film, as: $admin_user)
    within('.languages-list') do
      find('.x-button').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(FilmLanguage.count).to eq(0)
  end

  it 'adds actors' do
    visit film_path(@film, as: $admin_user)
    find('.blue-outline-button', text: 'Add Actor').click
    fill_out_and_submit_modal({
      first_name: 'Robert',
      last_name: 'DeNiro'
    })
    expect(Actor.last.attributes).to include(
      'first_name' => 'Robert',
      'last_name' => 'DeNiro'
    )
  end

  it 'removes actors' do
    visit film_path(@film, as: $admin_user)
    within('.actors-list') do
      find('.x-button').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(Actor.count).to eq(0)
  end

  it 'displays the synopses' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Synopses').click
    expect(find('textarea[data-field="synopsis"]').value).to eq 'Synopsis'
    expect(find('textarea[data-field="vodSynopsis"]').value).to eq 'VOD Synopsis'
    expect(find('textarea[data-field="shortSynopsis"]').value).to eq 'Short Synopsis'
    expect(find('textarea[data-field="logline"]').value).to eq 'Logline'
    expect(find('textarea[data-field="institutionalSynopsis"]').value).to eq 'Institutional Synopsis'
  end

  it 'updates the synopses' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Synopses').click
    fill_out_form({
      synopsis: 'New Synopsis',
      short_synopsis: 'New Short Synopsis',
      vod_synopsis: 'New VOD Synopsis',
      logline: 'New Logline',
      institutional_synopsis: 'New Institutional Synopsis'
    })
    find('.orange-button', text: 'Save').click
    expect(page).not_to have_selector('.spinner')
    expect(@film.reload.attributes).to include(
      'synopsis' => 'New Synopsis',
      'short_synopsis' => 'New Short Synopsis',
      'vod_synopsis' => 'New VOD Synopsis',
      'logline' => 'New Logline',
      'institutional_synopsis' => 'New Institutional Synopsis'
    )
  end

  it 'deletes the film' do
    visit film_path(@film, as: $admin_user)
    delete_button = find('.orange-button', text: 'Delete Film')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/films', ignore_query: true)
    expect(Film.find_by_id(@film.id)).to be(nil)
  end

end
