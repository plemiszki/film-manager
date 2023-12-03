require 'rails_helper'
require 'support/features_helper'

describe 'film_right_details', type: :feature do

  before(:each) do
    create(:right)
    create(:right, name: 'Non-Theatrical', order: 1)
    create(:territory)
    create(:territory, name: 'Canada')
    create(:label)
    create(:film)
    @film_right = create(:film_right)
  end

  it 'is gated' do
    visit film_right_path(@film_right)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the film right' do
    visit film_right_path(@film_right, as: $admin_user)
    wait_for_ajax
    expect(find('select[data-field="rightId"]', visible: false).value).to eq '1'
    expect(find('select[data-field="territoryId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="startDate"]').value).to eq Date.today.strftime('%-m/%-d/%Y')
    expect(find('input[data-field="endDate"]').value).to eq (Date.today + 1.year).strftime('%-m/%-d/%Y')
    expect(find('select[data-field="exclusive"]', visible: false).value).to eq 't'
  end

  it 'updates information about the film right' do
    visit film_right_path(@film_right, as: $admin_user)
    new_info = {
      right_id: { value: 2, type: :select },
      territory_id: { value: 2, type: :select },
      start_date: '12/1/2020',
      end_date: '12/15/2030',
      exclusive: { value: 'f', type: :select }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @film_right,
      data: new_info,
      db_data: { exclusive: false, start_date: Date.parse('12/1/2020'), end_date: Date.parse('12/15/2030') }
    )
  end

  it 'validates information about the film right' do
    create(:film_right, territory_id: 2)
    visit film_right_path(@film_right, as: $admin_user)
    fill_out_form({
      territory_id: { value: 2, type: :select },
      start_date: '2/1/2020',
      end_date: '1/1/2020'
    })
    save_and_wait
    expect(page).to have_content('Right has already been taken')
    expect(page).to have_content("End date cannot be before start date")
  end

  it 'deletes the film right' do
    visit film_right_path(@film_right, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path("/films/#{@film_right.film.id}", ignore_query: true)
    expect(FilmRight.find_by_id(@film_right.id)).to be(nil)
  end

end
