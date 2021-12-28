require 'rails_helper'
require 'support/features_helper'

describe 'episode_details', type: :feature do

  before(:each) do
    create(:label)
    create(:tv_series)
    @episode = create(:episode, film_id: 1)
  end

  it 'is gated' do
    visit episode_path(@episode)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the episode' do
    visit episode_path(@episode, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="title"]').value).to eq('Pilot')
    expect(find('input[data-field="length"]').value).to eq('60')
    expect(find('input[data-field="seasonNumber"]').value).to eq('1')
    expect(find('input[data-field="episodeNumber"]').value).to eq('1')
    expect(find('textarea[data-field="synopsis"]').value).to eq('This is the synopsis of the episode.')
  end

  it 'updates information about the episode' do
    visit episode_path(@episode, as: $admin_user)
    new_info = {
      title: 'New Title',
      length: 75,
      season_number: 2,
      episode_number: 3,
      synopsis: 'Greatest episode ever.'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @episode,
      data: new_info
    })
  end

  it 'validates information about the episode' do
    visit episode_path(@episode, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Title can't be blank")
    expect(page).to have_content('Length is not a number')
    expect(page).to have_content('Season number is not a number')
    expect(page).to have_content('Episode number is not a number')
  end

  it 'lists the cast' do
    create(:episode_actor)
    visit episode_path(@episode, as: $admin_user)
    expect(page).to have_content('Tom Hanks')
  end

  it 'adds cast members' do
    visit episode_path(@episode, as: $admin_user)
    find('.blue-outline-button', text: 'Add Actor').click
    fill_out_and_submit_modal({
      first_name: 'Julia',
      last_name: 'Roberts'
    }, :input)
    expect(page).to have_content('Julia Roberts')
  end

  it 'removes cast members' do
    @actor = create(:episode_actor)
    visit episode_path(@episode, as: $admin_user)
    within('.standard-list') do
      find('.x-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(page).to have_no_content('Tom Hanks')
    expect(Actor.find_by_id(@actor.id)).to be(nil)
  end

  it 'deletes the episode' do
    visit episode_path(@episode, as: $admin_user)
    delete_button = find('.delete-button', text: 'Delete')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/films/1', ignore_query: true)
    expect(Episode.find_by_id(@episode.id)).to be(nil)
  end

end
