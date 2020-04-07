require 'rails_helper'
require 'support/features_helper'

describe 'film_details', type: :feature do

  before(:each) do
    RevenueStream.create!(name: 'Theatrical', order: 0)
    RevenueStream.create!(name: 'Non-Theatrical', nickname: 'Non-T', order: 1)
    create(:label)
    create(:licensor)
    create(:licensor, name: 'Frog Productions')
    DealTemplate.create!(name: 'No Expenses Recouped')
    DealTemplate.create!(name: 'Expenses Recouped From Top')
    create_dvd_types
    @film = create(:film,
      title: 'Some Film',
      licensor_id: 1,
      start_date: '1/1/09',
      end_date: '1/1/19',
      sage_id: 'Sage ID',
      mg: 20_000,
      e_and_o: 2_000,
      expense_cap: 50_000,
      sell_off_period: 6,
      accept_delivery: '4/1/20',
      royalty_notes: 'royalty notes',
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
    Right.create!(name: 'Theatrical', order: 0)
    Right.create!(name: 'Non-Theatrical', order: 1)
    Territory.create!(name: 'USA', world: false)
    Territory.create!(name: 'Belgium', world: false)
    FilmRight.create!(film_id: @film.id, right_id: 1, territory_id: 1, start_date: '1/1/2020', end_date: '1/1/2021')
    FilmRight.create!(film_id: @film.id, right_id: 2, territory_id: 1, start_date: '1/1/2020', end_date: '1/1/2021')
    Director.create!(film_id: @film.id, first_name: 'Rob', last_name: 'Reiner')
    Country.create!(name: 'Canada')
    Country.create!(name: 'Belize')
    FilmCountry.create!(film_id: @film.id, country_id: 1)
    Language.create!(name: 'French')
    Language.create!(name: 'Spanish')
    FilmLanguage.create!(film_id: @film.id, language_id: 1)
    Actor.create!(actorable_id: @film.id, actorable_type: 'Film', first_name: 'Brad', last_name: 'Pitt', order: 0)
    Dvd.create!(feature_film_id: @film.id, dvd_type_id: 1)
  end

  it 'is gated' do
    visit film_path(@film)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays general information about the film' do
    visit film_path(@film, as: $admin_user)
    expect(page).not_to have_selector('.spinner')
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

  it 'adds directors' do
    visit film_path(@film, as: $admin_user)
    find('.blue-outline-button', text: 'Add Director').click
    fill_out_and_submit_modal({
      first_name: 'Johnny',
      last_name: 'Depp'
    }, :orange_button)
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
    }, :orange_button)
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

  # contract tab

  it 'displays the contract information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    expect(find('input[data-field="licensorId"]').value).to eq 'Hippo Entertainment'
    expect(find('input[data-field="startDate"]').value).to eq '1/1/09'
    expect(find('input[data-field="endDate"]').value).to eq '1/1/19'
    expect(find('input[data-field="sageId"]').value).to eq 'Sage ID'
    expect(find('select[data-field="dealTypeId"]', visible: false).value).to eq '1'
    expect(find('select[data-field="daysStatementDue"]', visible: false).value).to eq '30'
    expect(find('input[data-field="mg"]').value).to eq '$20,000.00'
    expect(find('input[data-field="eAndO"]').value).to eq '$2,000.00'
    expect(find('input[data-field="expenseCap"]').value).to eq '$50,000.00'
    expect(find('input[data-field="sellOffPeriod"]').value).to eq '6'
    expect(find('input[data-field="acceptDelivery"]').value).to eq '4/1/20'
    expect(find('textarea[data-field="royaltyNotes"]').value).to eq 'royalty notes'
    expect(find('input[data-thing="percentages"][data-field="1"]').value).to eq '0.0'
    expect(find('input[data-thing="percentages"][data-field="2"]').value).to eq '0.0'
  end

  it 'displays the licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    expect(find('.fm-admin-table')).to have_content('Theatrical')
    expect(find('.fm-admin-table')).to have_content('Non-Theatrical')
  end

  it 'updates contract information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    change_modal_select_field('licensorId', 'Frog Productions')
    fill_out_form({
      start_date: '1/1/2020',
      end_date: '1/1/2021',
      sage_id: 'NEW SAGE ID',
      deal_type_id: { value: 2, type: :select },
      days_statement_due: { value: 60, type: :select },
      mg: '$100,000',
      e_and_o: '$3,000',
      expense_cap: '$30,000',
      sell_off_period: 12,
      accept_delivery: '3/3/2033',
      royalty_notes: 'new royalty notes',
      '1': '50',
      '2': '50'
    })
    save_and_wait
    expect(@film.reload.attributes).to include(
      'licensor_id' => 2,
      'start_date' => Date.parse('1/1/2020'),
      'end_date' => Date.parse('1/1/2021'),
      'sage_id' => 'NEW SAGE ID',
      'deal_type_id' => 2,
      'days_statement_due' => 60,
      'mg' => BigDecimal(100_000),
      'e_and_o' => BigDecimal(3_000),
      'expense_cap' => BigDecimal(30_000),
      'sell_off_period' => 12,
      'accept_delivery' => Date.parse('3/3/2033'),
      'royalty_notes' => 'new royalty notes'
    )
    expect(@film.film_revenue_percentages.pluck(:value).uniq).to eq([0.5e2])
  end

  it 'adds licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    find('.blue-outline-button', text: 'Add Rights').click
    within('#film-rights-new') do
      find('label', text: 'Belgium').click
      find('.blue-outline-button', text: 'ALL', match: :first).click
      find('.orange-button', text: 'Add Rights').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(@film.film_rights.count).to eq(4)
    expect(find('.fm-admin-table')).to have_content('Belgium')
  end

  it 'changes dates of all licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    find('.blue-outline-button', text: 'Change All Dates').click
    within('#film-rights-change-dates') do
      fill_out_form({
        start_date: '3/3/2033',
        end_date: '4/4/2044'
      })
      find('.orange-button', text: 'Change All Dates').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(@film.reload.film_rights.pluck(:start_date).uniq).to eq([Date.parse('3/3/2033')])
    expect(@film.reload.film_rights.pluck(:end_date).uniq).to eq([Date.parse('4/4/2044')])
  end

  # synopses tab

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

  # marketing tab

  # bookings tab

  it "displays the film's booking information" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    expect(find('input[data-field="rating"]').value).to eq 'Not Rated'
    expect(find('input[data-field="aspectRatio"]').value).to eq '16:9'
    expect(find('input[data-field="soundConfig"]').value).to eq 'stereo'
  end

  it "updates the film's booking information" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    new_info = {
      rating: 'R',
      aspect_ratio: '4:3',
      sound_config: 'mono'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @film,
      data: new_info
    })
  end

  it "displays the film's screening formats" do
    create(:format)
    create(:film_format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    within('ul.screening-formats-list') do
      expect(page).to have_content('35mm')
    end
  end

  it 'adds screening formats' do
    create(:format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    find('.blue-outline-button', text: 'Add Format').click
    select_from_modal('35mm')
    expect(page).to have_no_css('.spinner')
    within('ul.screening-formats-list') do
      expect(page).to have_content('35mm')
    end
  end

  it 'removes screening formats' do
    create(:format)
    create(:film_format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    find('.x-button').click
    expect(page).to have_no_css('.spinner')
    expect(FilmFormat.count).to be(0)
    expect(page).to have_no_content('35mm')
  end

  it "displays the film's bookings" do
    create(:venue)
    create(:booking)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    within('.bookings-table') do
      expect(page).to have_content('Film at Lincoln Center')
    end
    within('.bookings-count-list') do
      expect(page).to have_content('Theatrical: 1')
    end
  end

  # dvds tab

  it "displays the film's dvds" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'DVDs').click
    expect(find('.fm-admin-table')).to have_content('Retail')
  end

  it 'adds dvds' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'DVDs').click
    find('.blue-outline-button', text: 'Add DVD').click
    within('#new-thing') do
      find('.orange-button', text: 'Add DVD').click
    end
    expect(page).to have_content('DVD Details')
    expect(@film.dvds.count).to eq(2)
  end

end
