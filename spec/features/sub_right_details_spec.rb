require 'rails_helper'
require 'support/features_helper'

describe 'sub_right_details', type: :feature do

  before :each do
    create(:label)
    create(:film)
    create(:film, title: 'Another Film')
    create(:right)
    create(:right, name: 'Non-Theatrical', order: 1)
    create(:territory)
    create(:territory, name: 'Canada')
    create(:sublicensor)
    @sub_right = create(:sub_right)
  end

  it 'is gated' do
    visit sub_right_path(@sub_right)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the sublicensed right' do
    visit sub_right_path(@sub_right, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="filmId"]').value).to eq "Wilby Wonderful"
    expect(find('select[data-field="rightId"]', visible: false).value).to eq '1'
    expect(find('select[data-field="territoryId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="startDate"]').value).to eq Date.today.strftime('%-m/%-d/%Y')
    expect(find('input[data-field="endDate"]').value).to eq (Date.today + 1.year).strftime('%-m/%-d/%Y')
    expect(find('select[data-field="exclusive"]', visible: false).value).to eq 'f'
  end

  it 'updates information about the sublicensed right' do
    visit sub_right_path(@sub_right, as: $admin_user)
    new_info = {
      film_id: { value: 'Another Film', type: :select_modal },
      right_id: { value: 2, type: :select },
      territory_id: { value: 2, type: :select },
      start_date: '12/1/2020',
      end_date: '12/15/2030',
      exclusive: { value: 't', type: :select }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @sub_right,
      data: new_info,
      db_data: { film_id: 2, exclusive: true, start_date: Date.parse('12/1/2020'), end_date: Date.parse('12/15/2030') }
    )
  end

  it 'validates information about the sublicensed right' do
    create(:sub_right, territory_id: 2)
    visit sub_right_path(@sub_right, as: $admin_user)
    clear_form
    fill_out_form({ territory_id: { value: 2, type: :select }})
    save_and_wait
    expect(page).to have_content('Right has already been taken')
    expect(page).to have_content("Start date can't be blank")
    expect(page).to have_content("End date can't be blank")
  end

  it 'deletes the sublicensed right' do
    visit sub_right_path(@sub_right, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path("/sublicensors/#{@sub_right.sublicensor.id}", ignore_query: true)
    expect(SubRight.find_by_id(@sub_right.id)).to be(nil)
  end

end
