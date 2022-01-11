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
    }, :input)
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
    }, :input)
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
    expect(find('input[data-id="1"]').value).to eq '0.0'
    expect(find('input[data-id="2"]').value).to eq '0.0'
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
    wait_for_ajax
    within('.fm-admin-table') do
      expect(page).to have_content('3/3/33')
      expect(page).to have_content('4/4/44')
    end
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
    find('.blue-button', text: 'Save').click
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

  it "displays the film's marketing information" do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
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
    verify_db_and_component({
      entity: @film,
      data: new_info,
      component_data: { rental_price: '$20.00' }
    })
  end

  it 'displays laurels' do
    create(:laurel)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.laurels-list') do
      expect(page).to have_content('Cannes International Film Festival')
    end
  end

  it 'add laurels' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Laurel').click
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
    within('.laurels-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(Laurel.count).to eq(0)
    expect(page).to have_no_content('Cannes International Film Festival')
  end

  it 'displays quotes' do
    create(:quote)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.quotes-list') do
      expect(page).to have_content('This is the greatest film in history.')
      expect(page).to have_content('Roger Ebert')
      expect(page).to have_content('Chicago Sun')
    end
  end

  it 'adds quotes' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Quote').click
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
    within('.genres-list') do
      expect(page).to have_content('Comedy')
    end
  end

  it 'adds genres' do
    create(:genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Genre').click
    select_from_modal('Comedy')
    expect(page).to have_no_css('.spinner')
    expect(FilmGenre.count).to eq(1)
    within('.genres-list') do
      expect(page).to have_content('Comedy')
    end
  end

  it 'removes genres' do
    create(:genre)
    create(:film_genre)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.genres-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(FilmGenre.count).to eq(0)
    expect(page).to have_no_content('Comedy')
  end

  it 'displays topics' do
    create(:topic)
    create(:film_topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.topics-list') do
      expect(page).to have_content('Latino')
    end
  end

  it 'adds topics' do
    create(:topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Topic').click
    select_from_modal('Latino')
    expect(page).to have_no_css('.spinner')
    expect(FilmTopic.count).to eq(1)
    within('.topics-list') do
      expect(page).to have_content('Latino')
    end
  end

  it 'removes topics' do
    create(:topic)
    create(:film_topic)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.topics-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(FilmTopic.count).to eq(0)
    expect(page).to have_no_content('Latino')
  end

  it 'displays alternate lengths' do
    create(:alternate_length)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-lengths-list') do
      expect(page).to have_content('60')
    end
  end

  it 'adds alternate lengths' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Length').click
    fill_out_and_submit_modal({ length: 60 }, :input)
    expect(AlternateLength.count).to eq(1)
    expect(page).to have_content('60')
  end

  it 'removes alternate lengths' do
    create(:alternate_length)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-lengths-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AlternateLength.count).to be(0)
    expect(page).to have_no_content('60')
  end

  it 'displays alternate audio tracks' do
    create(:alternate_audio)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-audios-list') do
      expect(page).to have_content('French')
    end
  end

  it 'adds alternate audio tracks' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Audio Track').click
    select_from_modal('French')
    expect(AlternateAudio.count).to eq(1)
    expect(page).to have_content('French')
  end

  it 'removes alternate audio tracks' do
    create(:alternate_audio)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-audios-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(AlternateAudio.count).to be(0)
    expect(page).to have_no_content('French')
  end

  it 'displays alternate subtitles' do
    create(:alternate_sub)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-subtitles-list') do
      expect(page).to have_content('French')
    end
  end

  it 'adds alternate subtitles' do
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Subtitles').click
    select_from_modal('French')
    expect(AlternateSub.count).to eq(1)
    expect(page).to have_content('French')
  end

  it 'removes alternate subtitles' do
    create(:alternate_sub)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    within('.alternate-subtitles-list') do
      find('.x-button').click
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
    within('.related-films-list') do
      expect(page).to have_content('Another Film')
    end
  end

  it 'adds related films' do
    create(:film, title: 'Another Film')
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Related Film').click
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
    within('.related-films-list') do
      find('.x-button').click
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
    within('.digital-retailers-table') do
      expect(page).to have_content('iTunes')
    end
  end

  it 'adds digital retailers' do
    create(:digital_retailer)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Digital Retailer').click
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
    find('div.tab', text: 'Marketing').click
    within('.edu-platforms-table') do
      expect(page).to have_content('Kanopy')
    end
  end

  it 'adds educational streaming platforms' do
    create(:edu_platform)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Platform').click
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
    find('div.tab', text: 'Marketing').click
    find('.blue-outline-button', text: 'Add Platform').click
    fill_out_and_submit_modal({
      edu_platform_id: { value: 1, type: :select },
      url: ''
    }, :input)
    expect(page).to have_no_css('.spinner')
    expect(EduPlatformFilm.count).to eq(1)
    expect(page).to have_content "Url can't be blank"
    expect(page).to have_content 'Edu platform has already been taken'
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
    create(:venue, label: 'Alamo Drafthouse Cinema')
    create(:virtual_booking, venue_id: 2)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Bookings').click
    within('.bookings-table') do
      expect(page).to have_content('Film at Lincoln Center')
      expect(page).to have_content('Theatrical')
      expect(page).to have_content('Alamo Drafthouse Cinema')
      expect(page).to have_content('Virtual')
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
    verify_db_and_component({
      entity: @film,
      data: {
        export_reports: false,
        ignore_sage_id: false
      },
      db_data: {
        send_reports: false
      }
    })
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
    find('.blue-outline-button', text: 'Add Film').click
    select_from_modal('Another Film')
    expect(page).to have_no_css('.spinner')
    expect(CrossedFilm.count).to eq(2)
    expect(page).to have_content('Another Film')
  end

  it 'displays statements' do
    create(:royalty_report)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Statements').click
    within('.fm-admin-table') do
      expect(page).to have_content('2019')
    end
  end

  # sublicensors tab

  it "displays the film's licensed rights" do
    create(:sublicensor)
    create(:sub_right)
    visit film_path(@film, as: $admin_user)
    find('div.tab', text: 'Sublicensing').click
    within('.fm-admin-table') do
      expect(page).to have_content('Kanopy')
    end
  end

  # episodes tab

  it 'displays the episodes' do
    @tv_series = create(:tv_series)
    create(:episode, film_id: @tv_series.id)
    visit film_path(@tv_series, as: $admin_user)
    find('div.tab', text: 'Episodes').click
    within('.fm-admin-table') do
      expect(page).to have_content('Pilot')
    end
  end

  it 'adds episodes' do
    @tv_series = create(:tv_series)
    create(:episode, film_id: @tv_series.id)
    visit film_path(@tv_series, as: $admin_user)
    find('div.tab', text: 'Episodes').click
    find('.blue-outline-button', text: 'Add Episode').click
    info = {
      title: 'Episode 2',
      length: 60,
      season_number: 1,
      episode_number: 2
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_no_css('.spinner')
    expect(current_path).to eq("/episodes/#{Episode.last.id}")
    verify_db_and_component({
      entity: Episode.last,
      data: info
    })
  end

  # bottom buttons

  it 'copies the film' do
    visit film_path(@film, as: $admin_user)
    copy_button = find('.orange-button', text: 'Copy Film')
    copy_button.click
    new_film_data = {
      title: 'New Film',
      year: 1999,
      length: 120
    }
    fill_out_and_submit_modal(new_film_data, :input)
    expect(page).to have_no_css('.spinner')
    verify_db({
      entity: Film.last,
      data: new_film_data
    })
    expect(page).to have_current_path("/films/#{Film.last.id}", ignore_query: true)
  end

  it 'deletes the film' do
    visit film_path(@film, as: $admin_user)
    delete_button = find('.delete-button', text: 'Delete')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/films', ignore_query: true)
    expect(Film.find_by_id(@film.id)).to be(nil)
  end

  it 'starts the update artwork job' do
    visit film_path(@film, as: $admin_user)
    find('.key-art').click
    find('.orange-button', text: 'Yes').click
    expect(page).to have_content('Updating Artwork')
  end

end
