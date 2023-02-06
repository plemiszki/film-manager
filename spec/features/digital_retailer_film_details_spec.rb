require 'rails_helper'
require 'support/features_helper'

describe 'digital_retailer_film_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:digital_retailer)
    create(:digital_retailer, name: 'Kanopy')
    @digital_retailer_film = create(:digital_retailer_film)
  end

  it 'is gated' do
    visit digital_retailer_film_path(@digital_retailer_film)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the digital retailer film' do
    visit digital_retailer_film_path(@digital_retailer_film, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="digitalRetailerId"]').value).to eq('iTunes')
    expect(find('input[data-field="url"]').value).to eq('https://itunes.com/wildywonderful')
  end

  it 'updates information about the digital retailer film' do
    visit digital_retailer_film_path(@digital_retailer_film, as: $admin_user)
    new_info = {
      digital_retailer_id: { value: 'Kanopy', type: :select_modal },
      url: 'https://itunes.com/kanopy'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @digital_retailer_film,
      data: new_info,
      db_data: {
        digital_retailer_id: 2
      },
    )
  end

  it 'validates information about the digital retailer film' do
    create(:digital_retailer_film, digital_retailer_id: 2)
    visit digital_retailer_film_path(@digital_retailer_film, as: $admin_user)
    clear_form
    fill_out_form({ digital_retailer_id: { value: 'Kanopy', type: :select_modal }})
    save_and_wait
    expect(page).to have_content "Url can't be blank"
    expect(page).to have_content "Digital retailer has already been taken"
  end

  it 'deletes digital retailer film' do
    visit digital_retailer_film_path(@digital_retailer_film, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path("/films/#{@digital_retailer_film.film.id}", ignore_query: true)
    expect(DigitalRetailerFilm.find_by_id(@digital_retailer_film.id)).to be(nil)
  end

end
