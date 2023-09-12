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
      start_date: '1/1/2009',
      end_date: '1/1/2019',
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
      fm_plus_release: '4/1/2003',
      synopsis: 'Synopsis',
      vod_synopsis: 'VOD Synopsis',
      short_synopsis: 'Short Synopsis',
      logline: 'Logline',
      institutional_synopsis: 'Institutional Synopsis',
      tv_rating: 'R'
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
    create(:language)
    create(:language, name: 'Spanish')
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
    wait_for_ajax
    expect(page).not_to have_selector('.spinner')
    expect(find('input[data-field="title"]').value).to eq 'Some Film'
    expect(find(list_box_selector("directors"))).to have_content('Rob Reiner')
    expect(find('select[data-field="labelId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="year"]').value).to eq '2002'
    expect(find('input[data-field="length"]').value).to eq '90'
    expect(find(list_box_selector("countries"))).to have_content('Canada')
    expect(find(list_box_selector("languages"))).to have_content('French')
    expect(find(list_box_selector("actors"))).to have_content('Brad Pitt')
    expect(find('input[data-field="clubDate"]').value).to eq '11/1/02'
    expect(find('input[data-field="theatricalRelease"]').value).to eq '12/1/02'
    expect(find('input[data-field="svodRelease"]').value).to eq '1/1/03'
    expect(find('input[data-field="tvodRelease"]').value).to eq '2/1/03'
    expect(find('input[data-field="avodRelease"]').value).to eq '3/1/03'
    expect(find('input[data-field="fmPlusRelease"]').value).to eq '4/1/03'
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
      tvod_release: '3/1/2021?',
      fm_plus_release: '4/1/2021',
    })
    save_and_wait
    expect(@film.reload.attributes).to include(
      'title' => 'New Title',
      'year' => 1999,
      'length' => 120,
      'club_date' => Date.parse('11/1/2020'),
      'theatrical_release' => Date.parse('12/1/2020'),
      'svod_release' => Date.parse('1/1/2021'),
      'avod_release' => Date.parse('2/1/2021'),
      'tvod_release' => Date.parse('3/1/2021'),
      'tvod_tentative' => true,
      'fm_plus_release' => Date.parse('4/1/2021'),
    )
  end

  it 'adds directors' do
    visit film_path(@film, as: $admin_user)
    click_btn("Add Director")
    fill_out_and_submit_modal({
      first_name: 'Johnny',
      last_name: 'Depp'
    }, :input)
    expect(Director.last.attributes).to include(
      'first_name' => 'Johnny',
      'last_name' => 'Depp'
    )
  end

  it 'removes directors' do
    visit film_path(@film, as: $admin_user)
    within(list_box_selector("directors")) do
      find('.x-gray-circle').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(Director.count).to eq(0)
  end

  it 'adds countries' do
    visit film_path(@film, as: $admin_user)
    click_btn('Add Country')
    select_from_modal('Belize')
    expect(FilmCountry.last.country.attributes).to include(
      'name' => 'Belize'
    )
  end

  it 'removes countries' do
    visit film_path(@film, as: $admin_user)
    within(list_box_selector("countries")) do
      find('.x-gray-circle').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(FilmCountry.count).to eq(0)
  end

  it 'adds languages' do
    visit film_path(@film, as: $admin_user)
    click_btn('Add Language')
    select_from_modal('Spanish')
    expect(FilmLanguage.last.language.attributes).to include(
      'name' => 'Spanish'
    )
  end

  it 'removes languages' do
    visit film_path(@film, as: $admin_user)
    within(list_box_selector("languages")) do
      find('.x-gray-circle').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(FilmLanguage.count).to eq(0)
  end

  it 'adds actors' do
    visit film_path(@film, as: $admin_user)
    click_btn('Add Actor')
    fill_out_and_submit_modal({
      first_name: 'Robert',
      last_name: 'DeNiro'
    }, :input)
    expect(Actor.last.attributes).to include(
      'first_name' => 'Robert',
      'last_name' => 'DeNiro'
    )
  end

  it 'removes actors' do
    visit film_path(@film, as: $admin_user)
    within(list_box_selector("actors")) do
      find('.x-gray-circle').click
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
    expect(find('input[data-field="1"]').value).to eq '0.0'
    expect(find('input[data-field="2"]').value).to eq '0.0'
  end

  it 'displays the licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    expect(find('table')).to have_content('Theatrical')
    expect(find('table')).to have_content('Non-Theatrical')
  end

  it 'updates contract information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    fill_out_form({
      start_date: '1/1/2020',
      end_date: '1/1/2021',
      sage_id: 'NEW SAGE ID',
      licensor_id: { value: 'Frog Productions', type: :select_modal },
      deal_type_id: { value: 2, type: :select },
      days_statement_due: { value: 60, type: :select },
      mg: '$100,000',
      e_and_o: '$3,000',
      expense_cap: '$30,000',
      sell_off_period: 12,
      accept_delivery: '3/3/2033',
      royalty_notes: 'new royalty notes',
      auto_renew: { value: true, type: :switch },
      auto_renew_opt_out: { value: true, type: :switch },
      '1': '50',
      '2': '50',
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
      'royalty_notes' => 'new royalty notes',
      'auto_renew' => true,
      'auto_renew_opt_out' => true,
    )
    expect(@film.film_revenue_percentages.pluck(:value).uniq).to eq([0.5e2])
  end

  it 'adds licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    click_btn('Add Rights')
    within('.admin-modal') do
      find('label', text: 'Belgium').click
      find('a', text: 'ALL', match: :first).click
      click_btn('Add Rights')
    end
    expect(page).not_to have_selector('.spinner')
    expect(@film.film_rights.count).to eq(4)
    expect(find('table')).to have_content('Belgium')
  end

  it 'changes dates of all licensed rights' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Contract').click
    click_btn('Change All Dates')
    within('.admin-modal') do
      fill_out_form({
        start_date: '3/3/2033',
        end_date: '4/4/2034'
      })
      click_btn('Change All Dates')
    end
    wait_for_ajax
    within('table') do
      expect(page).to have_content('3/3/33')
      expect(page).to have_content('4/4/34')
    end
    expect(@film.reload.film_rights.pluck(:start_date).uniq).to eq([Date.parse('3/3/2033')])
    expect(@film.reload.film_rights.pluck(:end_date).uniq).to eq([Date.parse('4/4/2034')])
  end

  # educational tab

  it 'displays the film\'s educational information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    expect(find('textarea[data-field="institutionalSynopsis"]').value).to eq 'Institutional Synopsis'

    expect(find('input[data-field="msrpPreStreet"]').value).to eq '$150.00'
    expect(find('input[data-field="pprPreStreet"]').value).to eq '$350.00'
    expect(find('input[data-field="drlPreStreet"]').value).to eq '$499.00'
    expect(find('input[data-field="pprDrlPreStreet"]').value).to eq '$599.00'

    expect(find('input[data-field="msrpPreStreetMember"]').value).to eq '$100.00'
    expect(find('input[data-field="pprPreStreetMember"]').value).to eq '$300.00'
    expect(find('input[data-field="drlPreStreetMember"]').value).to eq '$450.00'
    expect(find('input[data-field="pprDrlPreStreetMember"]').value).to eq '$550.00'

    expect(find('input[data-field="pprPostStreet"]').value).to eq '$200.00'
    expect(find('input[data-field="drlPostStreet"]').value).to eq '$499.00'
    expect(find('input[data-field="pprDrlPostStreet"]').value).to eq '$599.00'

    expect(find('input[data-field="pprPostStreetMember"]').value).to eq '$150.00'
    expect(find('input[data-field="drlPostStreetMember"]').value).to eq '$450.00'
    expect(find('input[data-field="pprDrlPostStreetMember"]').value).to eq '$550.00'
  end

  it 'updates the film\'s educational information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    new_info = {
      institutional_synopsis: 'New Institutional Synopsis',
      msrp_pre_street: '$1.00',
      ppr_pre_street: '$2.00',
      drl_pre_street: '$3.00',
      ppr_drl_pre_street: '$4.00',
      msrp_pre_street_member: '$5.00',
      ppr_pre_street_member: '$6.00',
      drl_pre_street_member: '$7.00',
      ppr_drl_pre_street_member: '$8.00',
      ppr_post_street: '$10.00',
      drl_post_street: '$11.00',
      ppr_drl_post_street: '$12.00',
      ppr_post_street_member: '$14.00',
      drl_post_street_member: '$15.00',
      ppr_drl_post_street_member: '$16.00',
    }
    fill_out_form(new_info)
    click_btn("Save")
    expect(page).not_to have_selector('.spinner')
    verify_db_and_component(
      entity: @film,
      data: new_info,
      db_data: {
        msrp_pre_street: 1,
        ppr_pre_street: 2,
        drl_pre_street: 3,
        ppr_drl_pre_street: 4,
        msrp_pre_street_member: 5,
        ppr_pre_street_member: 6,
        drl_pre_street_member: 7,
        ppr_drl_pre_street_member: 8,
        ppr_post_street: 10,
        drl_post_street: 11,
        ppr_drl_post_street: 12,
        ppr_post_street_member: 14,
        drl_post_street_member: 15,
        ppr_drl_post_street_member: 16,
      },
    )
  end

  it 'validates the film\'s educational information' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    new_info = {
      msrp_pre_street: '',
      ppr_pre_street: '',
      ppr_post_street: '',
      drl_pre_street: '',
      msrp_pre_street_member: '',
      ppr_pre_street_member: '',
      ppr_post_street_member: '',
      drl_pre_street_member: '',
      drl_post_street: '',
      ppr_drl_pre_street: '',
      ppr_drl_post_street: '',
      drl_post_street_member: '',
      ppr_drl_pre_street_member: '',
      ppr_drl_post_street_member: '',
    }
    fill_out_form(new_info)
    click_btn("Save")
    expect(page).not_to have_selector('.spinner')
    expect(page).to have_content('Msrp pre street is not a number')
    expect(page).to have_content('Ppr pre street is not a number')
    expect(page).to have_content('Ppr post street is not a number')
    expect(page).to have_content('Drl pre street is not a number')
    expect(page).to have_content('Drl post street is not a number')
    expect(page).to have_content('Ppr drl pre street is not a number')
    expect(page).to have_content('Ppr drl post street is not a number')
    expect(page).to have_content('Msrp pre street member is not a number')
    expect(page).to have_content('Ppr pre street member is not a number')
    expect(page).to have_content('Ppr post street member is not a number')
    expect(page).to have_content('Drl pre street member is not a number')
    expect(page).to have_content('Drl post street member is not a number')
    expect(page).to have_content('Ppr drl pre street member is not a number')
    expect(page).to have_content('Ppr drl post street member is not a number')
  end

  # marketing tab

  it "displays the film's marketing information" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    expect(find('textarea[data-field="synopsis"]').value).to eq 'Synopsis'
    expect(find('textarea[data-field="vodSynopsis"]').value).to eq 'VOD Synopsis'
    expect(find('textarea[data-field="shortSynopsis"]').value).to eq 'Short Synopsis'
    expect(find('textarea[data-field="logline"]').value).to eq 'Logline'
    expect(find('input[data-field="fmPlusUrl"]').value).to eq 'https://www.filmmovementplus.com/wilbywonderful'
    expect(find('input[data-field="standaloneSite"]').value).to eq 'https://www.wilbywonderful.com'
    expect(find('input[data-field="vimeoTrailer"]').value).to eq 'http://vimeo.com/68840880'
    expect(find('input[data-field="youtubeTrailer"]').value).to eq 'https://www.youtube.com/watch?v=PCu7WguDGGY'
    expect(find('input[data-field="proresTrailer"]').value).to eq 'https://www.dropbox.com/s/g2ysczkh6ulvrbf/MyArt_Trailer_ProRes.mov?dl=0'
    expect(find('input[data-field="facebookLink"]').value).to eq 'https://www.facebook.com/wilbywonderful'
    expect(find('input[data-field="twitterLink"]').value).to eq 'https://twitter.com/wilbywonderful'
    expect(find('input[data-field="instagramLink"]').value).to eq 'https://www.instagram.com/wilbywonderful'
    expect(find('input[data-field="rentalUrl"]').value).to eq 'https://www.filmmovement.com/rentals/wilbywonderful'
    expect(find('input[data-field="imdbId"]').value).to eq 'tt2328696'
    expect(find('input[data-field="active"]', visible: false).checked?).to eq true
    expect(find('input[data-field="eduPage"]', visible: false).checked?).to eq true
    expect(find('input[data-field="videoPage"]', visible: false).checked?).to eq true
    expect(find('input[data-field="nowPlayingPage"]', visible: false).checked?).to eq true
    expect(find('input[data-field="dayAndDate"]', visible: false).checked?).to eq true
    expect(find('input[data-field="certifiedFresh"]', visible: false).checked?).to eq true
    expect(find('input[data-field="criticsPick"]', visible: false).checked?).to eq true
    expect(find('input[data-field="rentalDays"]').value).to eq '3'
    expect(find('input[data-field="rentalPrice"]').value).to eq '$10.00'
    expect(find('input[data-field="tvRating"]').value).to eq 'R'
  end

  it "updates the film's marketing information" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    new_info = {
      synopsis: 'New Synopsis',
      short_synopsis: 'New Short Synopsis',
      vod_synopsis: 'New VOD Synopsis',
      logline: 'New Logline',
      fm_plus_url: 'https://www.filmmovementplus.com/vilbyvonderful',
      standalone_site: 'https://www.vilbyvonderful.com',
      vimeo_trailer: 'http://vimeo.com/1',
      youtube_trailer: 'https://www.youtube.com/watch?v=1',
      prores_trailer: 'https://www.dropbox.com/s/g2ysczkh6ulvrbf/Another_Trailer_ProRes.mov?dl=0',
      facebook_link: 'https://www.facebook.com/vilbyvonderful',
      twitter_link: 'https://twitter.com/vilbyvonderful',
      instagram_link: 'https://www.instagram.com/vilbyvonderful',
      imdb_id: 'tt20736',
      active: { value: false, type: :switch },
      edu_page: { value: false, type: :switch },
      video_page: { value: false, type: :switch },
      now_playing_page: { value: false, type: :switch },
      day_and_date: { value: false, type: :switch },
      certified_fresh: { value: false, type: :switch },
      critics_pick: { value: false, type: :switch },
      rental_url: 'https://www.filmmovement.com/rentals/vilbyvonderful',
      rental_days: 4,
      rental_price: 20,
      tv_rating: 'G'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @film,
      data: new_info,
      component_data: { rental_price: '$20.00' }
    )
  end

  it 'displays laurels' do
    create(:laurel)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("laurels")) do
      expect(page).to have_content('Cannes International Film Festival')
    end
  end

  it 'add laurels' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Laurel")
    laurel_info = {
      result: { value: 'Nominated', type: :select },
      award_name: 'Best Film',
      festival: 'Academy Awards'
    }
    fill_out_and_submit_modal(laurel_info, :input)
    expect(Laurel.count).to eq(1)
    expect(page).to have_content('Nominated - Best Film - Academy Awards')
  end

  it 'removes laurels' do
    create(:laurel)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("laurels")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(Laurel.count).to eq(0)
    expect(page).to have_no_content('Cannes International Film Festival')
  end

  it 'displays quotes' do
    create(:quote)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(".quotes-list") do
      expect(page).to have_content('This is the greatest film in history.')
      expect(page).to have_content('Roger Ebert')
      expect(page).to have_content('Chicago Sun')
    end
  end

  it 'adds quotes' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Quote")
    quote_info = {
      text: 'I thought I died and went to heaven.',
      author: 'Peter Biskind',
      publication: 'Rolling Stone'
    }
    fill_out_and_submit_modal(quote_info, :input)
    expect(Quote.count).to eq(1)
    expect(page).to have_content('"I thought I died and went to heaven."')
    expect(page).to have_content('Peter Biskind, Rolling Stone')
  end

  it 'displays genres' do
    create(:genre)
    create(:film_genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("genres")) do
      expect(page).to have_content('Comedy')
    end
  end

  it 'adds genres' do
    create(:genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Genre")
    select_from_modal('Comedy')
    expect(page).to have_no_css('.spinner')
    expect(FilmGenre.count).to eq(1)
    within(list_box_selector("genres")) do
      expect(page).to have_content('Comedy')
    end
  end

  it 'removes genres' do
    create(:genre)
    create(:film_genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("genres")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(FilmGenre.count).to eq(0)
    expect(page).to have_no_content('Comedy')
  end

  it 'displays topics' do
    create(:topic)
    create(:film_topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    within(list_box_selector("topics")) do
      expect(page).to have_content('Latino')
    end
  end

  it 'adds topics' do
    create(:topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    click_btn("Add Topic")
    select_from_modal('Latino')
    expect(page).to have_no_css('.spinner')
    expect(FilmTopic.count).to eq(1)
    within(list_box_selector("topics")) do
      expect(page).to have_content('Latino')
    end
  end

  it 'removes topics' do
    create(:topic)
    create(:film_topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    within(list_box_selector("topics")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(FilmTopic.count).to eq(0)
    expect(page).to have_no_content('Latino')
  end

  it 'displays alternate lengths' do
    create(:alternate_length)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-lengths")) do
      expect(page).to have_content('60')
    end
  end

  it 'adds alternate lengths' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Length")
    fill_out_and_submit_modal({ length: 60 }, :input)
    expect(AlternateLength.count).to eq(1)
    expect(page).to have_content('60')
  end

  it 'removes alternate lengths' do
    create(:alternate_length)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-lengths")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AlternateLength.count).to be(0)
    expect(page).to have_no_content('60')
  end

  it 'displays alternate audio tracks' do
    create(:alternate_audio)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-audios")) do
      expect(page).to have_content('French')
    end
  end

  it 'adds alternate audio tracks' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Audio Track")
    select_from_modal('French')
    expect(AlternateAudio.count).to eq(1)
    expect(page).to have_content('French')
  end

  it 'removes alternate audio tracks' do
    create(:alternate_audio)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-audios")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AlternateAudio.count).to be(0)
    expect(page).to have_no_content('French')
  end

  it 'displays alternate subtitles' do
    create(:alternate_sub)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-subs")) do
      expect(page).to have_content('French')
    end
  end

  it 'adds alternate subtitles' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Subtitles")
    select_from_modal('French')
    expect(AlternateSub.count).to eq(1)
    expect(page).to have_content('French')
  end

  it 'removes alternate subtitles' do
    create(:alternate_sub)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("alternate-subs")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AlternateSub.count).to be(0)
    expect(page).to have_no_content('French')
  end

  it 'displays related films' do
    create(:film, title: 'Another Film')
    create(:related_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("related-films")) do
      expect(page).to have_content('Another Film')
    end
  end

  it 'adds related films' do
    create(:film, title: 'Another Film')
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Related Film")
    select_from_modal('Another Film')
    expect(page).to have_no_css('.spinner')
    expect(RelatedFilm.count).to eq(1)
    expect(page).to have_content('Another Film')
  end

  it 'removes related films' do
    create(:film, title: 'Another Film')
    create(:related_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("related-films")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(RelatedFilm.count).to be(0)
    expect(page).to have_no_content('Another Film')
  end

  it 'displays digital retailers' do
    create(:digital_retailer)
    create(:digital_retailer_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within("table") do
      expect(page).to have_content('iTunes')
    end
  end

  it 'adds digital retailers' do
    create(:digital_retailer)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Digital Retailer")
    fill_out_and_submit_modal({
      digital_retailer_id: { value: 1, type: :select },
      url: 'https://www.itunes.com/another_film'
    }, :input)
    expect(page).to have_no_css('.spinner')
    expect(DigitalRetailerFilm.count).to eq(1)
    expect(page).to have_content('iTunes')
    expect(page).to have_content('https://www.itunes.com/another_film')
  end

  it 'displays educational streaming platforms' do
    create(:edu_platform)
    create(:edu_platform_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    within("table") do
      expect(page).to have_content('Kanopy')
    end
  end

  it 'adds educational streaming platforms' do
    create(:edu_platform)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    click_btn("Add Platform")
    fill_out_and_submit_modal({
      edu_platform_id: { value: 1, type: :select },
      url: 'https://www.kanopy.com/asdf'
    }, :input)
    expect(page).to have_no_css('.spinner')
    expect(EduPlatformFilm.count).to eq(1)
    expect(page).to have_content('Kanopy')
    expect(page).to have_content('https://www.kanopy.com/asdf')
  end

  it 'validates new educational streaming platforms' do
    create(:edu_platform)
    create(:edu_platform_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Educational').click
    click_btn("Add Platform")
    fill_out_and_submit_modal({
      edu_platform_id: { value: 1, type: :select },
      url: ''
    }, :input)
    expect(page).to have_no_css('.spinner')
    expect(EduPlatformFilm.count).to eq(1)
    expect(page).to have_content "Url can't be blank"
    expect(page).to have_content 'Edu platform has already been taken'
  end

  it 'adds amazon genres' do
    create(:amazon_genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Amazon Genre")
    select_from_modal('av_genre_action')
    expect(page).to have_no_css('.spinner')
    expect(AmazonGenreFilm.count).to eq(1)
    within(list_box_selector("amazon-genres")) do
      expect(page).to have_content('av_genre_action')
    end
  end

  it 'removes amazon genres' do
    create(:amazon_genre)
    create(:amazon_genre_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("amazon-genres")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AmazonGenreFilm.count).to eq(0)
    expect(page).to have_no_content('av_genre_action')
  end

  it 'adds amazon languages' do
    create(:amazon_language)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    click_btn("Add Amazon Language")
    select_from_modal('English (UK)')
    expect(page).to have_no_css('.spinner')
    expect(AmazonLanguageFilm.count).to eq(1)
    within(list_box_selector("amazon-languages")) do
      expect(page).to have_content('English (UK)')
    end
  end

  it 'removes amazon languages' do
    create(:amazon_language)
    create(:amazon_language_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within(list_box_selector("amazon-languages")) do
      find('.x-gray-circle').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AmazonLanguageFilm.count).to eq(0)
    expect(page).to have_no_content('English (UK)')
  end

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
    verify_db_and_component(
      entity: @film,
      data: new_info
    )
  end

  it "displays the film's screening formats" do
    create(:format)
    create(:film_format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    within(list_box_selector("formats")) do
      expect(page).to have_content('35mm')
    end
  end

  it 'adds screening formats' do
    create(:format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    click_btn("Add Format")
    select_from_modal('35mm')
    expect(page).to have_no_css('.spinner')
    within(list_box_selector("formats")) do
      expect(page).to have_content('35mm')
    end
  end

  it 'removes screening formats' do
    create(:format)
    create(:film_format)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    find('.x-gray-circle').click
    expect(page).to have_no_css('.spinner')
    expect(FilmFormat.count).to be(0)
    expect(page).to have_no_content('35mm')
  end

  it "displays the film's bookings" do
    create(:venue)
    create(:booking)
    create(:venue, label: 'Alamo Drafthouse Cinema')
    create(:virtual_booking, venue_id: 2)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    within('table') do
      expect(page).to have_content('Film at Lincoln Center')
      expect(page).to have_content('Theatrical')
      expect(page).to have_content('Alamo Drafthouse Cinema')
      expect(page).to have_content('Virtual')
    end
    within('.bookings-count-list') do
      expect(page).to have_content('Theatrical: 1')
    end
  end

  it "displays the total box office" do
    create(:venue)
    theatrical_booking_1 = create(:booking)
    theatrical_booking_1.update(box_office: 1000)
    theatrical_booking_2 = create(:booking)
    theatrical_booking_2.update(box_office: 500)
    non_theatrical_booking = create(:booking, booking_type: 'Non-Theatrical')
    non_theatrical_booking.update(box_office: 400)
    virtual_booking = create(:virtual_booking)
    virtual_booking.update(box_office: 300)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    total_box_office = find('p.total-box-office').text
    expect(total_box_office).to eq('Total Box Office: $1,500.00')
  end

  it "displays the number of missing box office reports" do
    create(:venue)
    create(:booking)
    create(:booking)
    create(:booking, box_office_received: true)
    create(:booking, booking_type: 'Non-Theatrical')
    create(:virtual_booking)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    missing_reports = find('p.missing-reports').text
    expect(missing_reports).to eq('Missing Box Office Reports: 2')
  end

  # dvds tab

  it "displays the film's dvds" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'DVDs').click
    expect(find('table')).to have_content('Retail')
  end

  it 'adds dvds' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'DVDs').click
    click_btn("Add DVD")
    info = {
      dvd_type_id: { value: 'Club', type: :select_modal },
    }
    fill_out_and_submit_modal(info, :input)
    wait_for_ajax
    expect(current_path).to eq("/dvds/#{Dvd.last.id}")
    expect(@film.dvds.count).to eq(2)
  end

  # statements

  it 'displays information about statements' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    expect(find('input[data-field="exportReports"]', visible: false).checked?).to eq true
    expect(find('input[data-field="sendReports"]', visible: false).checked?).to eq true
    expect(find('input[data-field="ignoreSageId"]', visible: false).checked?).to eq true
  end

  it 'updates information about statements' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    new_info = {
      send_reports: { value: false, type: :switch },
      export_reports: { value: false, type: :switch },
      ignore_sage_id: { value: false, type: :switch }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @film,
      data: {
        export_reports: false,
        ignore_sage_id: false
      },
      db_data: {
        send_reports: false
      }
    )
  end

  it 'displays crossed films' do
    create(:film, title: 'Another Film')
    create(:crossed_film)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    expect(page).to have_content('Another Film')
  end

  it 'adds crossed films' do
    create(:film, title: 'Another Film')
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    click_btn("Add Film")
    select_from_modal('Another Film')
    expect(page).to have_no_css('.spinner')
    expect(CrossedFilm.count).to eq(2)
    expect(page).to have_content('Another Film')
  end

  it 'displays statements' do
    create(:royalty_report)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    within('table') do
      expect(page).to have_content('2019')
    end
  end

  # sublicensors tab

  it "displays the film's licensed rights" do
    create(:sublicensor)
    create(:sub_right)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Sublicensing').click
    within('table') do
      expect(page).to have_content('Kanopy')
    end
  end

  # episodes tab

  it 'displays the episodes' do
    @tv_series = create(:tv_series)
    create(:episode, film_id: @tv_series.id)
    visit film_path(@tv_series, as: $admin_user)
    find('div.tab', text: 'Episodes').click
    within('table') do
      expect(page).to have_content('Pilot')
    end
  end

  it 'adds episodes' do
    @tv_series = create(:tv_series)
    create(:episode, film_id: @tv_series.id)
    visit film_path(@tv_series, as: $admin_user)
    find('div.tab', text: 'Episodes').click
    click_btn("Add Episode")
    info = {
      title: 'Episode 2',
      length: 60,
      season_number: 1,
      episode_number: 2
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_no_css('.spinner')
    expect(current_path).to eq("/episodes/#{Episode.last.id}")
    verify_db_and_component(
      entity: Episode.last,
      data: info
    )
  end

  # bottom buttons

  it 'validates the film when copying' do
    visit film_path(@film, as: $admin_user)
    click_btn('Copy Film')
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content("Title can't be blank")
    expect(page).to have_content('Year is not a number')
    expect(page).to have_content('Length is not a number')
  end

  it 'copies the film' do
    visit film_path(@film, as: $admin_user)
    click_btn('Copy Film')
    new_film_data = {
      title: 'New Film',
      year: 1999,
      length: 120
    }
    fill_out_and_submit_modal(new_film_data, :input)
    expect(page).to have_no_css('.spinner')
    verify_db(
      entity: Film.last,
      data: new_film_data
    )
    expect(page).to have_current_path("/films/#{Film.last.id}", ignore_query: true)
  end

  it 'deletes the film' do
    visit film_path(@film, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/films', ignore_query: true)
    expect(Film.find_by_id(@film.id)).to be(nil)
  end

  it 'starts the update artwork job' do
    visit film_path(@film, as: $admin_user)
    find('.key-art').click
    click_btn('Yes')
    expect(page).to have_content('Updating Artwork')
  end

  it 'starts the export XML MEC job' do
    visit film_path(@film, as: $admin_user)
    click_btn('XML - MEC')
    expect(page).to have_content('Exporting XML (MEC)')
  end

  it 'starts the export XML MMC job' do
    visit film_path(@film, as: $admin_user)
    click_btn('XML - MMC')
    expect(page).to have_content('Exporting XML (MMC)')
  end

end
