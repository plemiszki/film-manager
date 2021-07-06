require 'rails_helper'
require 'support/features_helper'

describe 'genre_details', type: :feature do

  before(:each) do
    create(:setting)
    @genre = create(:genre)
  end

  it 'is gated' do
    visit genre_path(@genre)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the genre' do
    visit genre_path(@genre, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('Comedy')
  end

  it 'updates information about the genre' do
    visit genre_path(@genre, as: $admin_user)
    new_info = {
      name: 'Drama'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @genre,
      data: new_info
    })
  end

  it 'validates information about the genre' do
    visit genre_path(@genre, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the genre' do
    visit genre_path(@genre, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Genre.find_by_id(@genre.id)).to be(nil)
  end

end
