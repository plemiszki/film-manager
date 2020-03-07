require 'rails_helper'
require 'support/features_helper'

describe 'film_details', type: :feature do

  before(:each) do
    create(:label)
    DvdType.create!(name: 'Retail')
    @film = create(:film,
      title: 'Some Film',
      synopsis: 'Synopsis',
      vod_synopsis: 'VOD Synopsis',
      short_synopsis: 'Short Synopsis',
      logline: 'Logline',
      institutional_synopsis: 'Institutional Synopsis'
    )
  end

  it 'is gated' do
    visit film_path(@film)
    expect(page).to have_content 'Please sign in to continue.'
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

end
