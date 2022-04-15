require 'rails_helper'
require 'support/features_helper'

describe 'edu_platform_film_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:edu_platform)
    create(:edu_platform, name: 'NYU')
    @edu_platform_film = create(:edu_platform_film)
  end

  it 'is gated' do
    visit edu_platform_film_path(@edu_platform_film)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the educational platform film' do
    visit edu_platform_film_path(@edu_platform_film, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="eduPlatformId"]').value).to eq('Kanopy')
    expect(find('input[data-field="url"]').value).to eq('https://kanopy.com/asdf')
  end

  it 'updates information about the educational platform film' do
    visit edu_platform_film_path(@edu_platform_film, as: $admin_user)
    new_info = {
      edu_platform_id: { value: 'NYU', type: :select_modal },
      url: 'https://nyu.com'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @edu_platform_film,
      data: new_info,
      db_data: {
        edu_platform_id: 2
      },
    )
  end

  it 'validates information about the educational platform film' do
    create(:edu_platform_film, edu_platform_id: 2)
    visit edu_platform_film_path(@edu_platform_film, as: $admin_user)
    clear_form
    fill_out_form({ edu_platform_id: { value: 'NYU', type: :select_modal }})
    save_and_wait
    expect(page).to have_content "Url can't be blank"
    expect(page).to have_content "Edu platform has already been taken"
  end

  it 'deletes educational platform film' do
    visit edu_platform_film_path(@edu_platform_film, as: $admin_user)
    delete_button = find('.delete-button', text: 'Delete')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path("/films/#{@edu_platform_film.film.id}", ignore_query: true)
    expect(EduPlatformFilm.find_by_id(@edu_platform_film.id)).to be(nil)
  end

end
