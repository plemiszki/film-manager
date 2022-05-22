require 'rails_helper'
require 'support/features_helper'

describe 'sublicensor_details', type: :feature do

  before(:each) do
    @sublicensor = create(:sublicensor)
  end

  it 'is gated' do
    visit sublicensor_path(@sublicensor)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the sublicensor' do
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq 'Kanopy'
    expect(find('input[data-field="contactName"]').value).to eq 'Becky LePlant'
    expect(find('input[data-field="email"]').value).to eq 'someone@kanopy.com'
    expect(find('input[data-field="phone"]').value).to eq '212-941-7744'
    expect(find('select[data-field="w8"]', visible: false).value).to eq 't'
  end

  it 'updates information about the sublicensor' do
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    new_info = {
      name: 'Fandor',
      contact_name: 'Joe Schmo',
      email: 'joe@fandor.com',
      phone: '555-555-5555',
      w8: { value: 'f', type: :select }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @sublicensor,
      data: new_info,
      db_data: { w8: false }
    )
  end

  it 'validates information about the sublicensor' do
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    clear_form
    save_and_wait
    expect(page).to have_content "Name can't be blank"
  end

  it 'displays the sublicensed rights' do
    create(:label)
    create(:film)
    create(:right)
    create(:territory)
    create(:sub_right)
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    within('.search-index') do
      expect(page).to have_content 'Wilby Wonderful'
    end
  end

  it 'adds sublicensed rights' do
    create(:label)
    create(:film)
    create(:right)
    create(:territory)
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    find('.new-button', text: 'Add Rights').click
    within('#film-rights-new') do
      fill_out_form({
        start_date: '1/1/2010',
        end_date: '1/1/2020'
      })
      find_all('.blue-outline-button', text: 'ALL').each { |button| button.click }
      find('.orange-button').click
    end
    wait_for_ajax
    within('.search-index') do
      expect(page).to have_content 'Wilby Wonderful'
      expect(page).to have_content 'Theatrical'
      expect(page).to have_content 'USA'
    end
  end

  it 'deletes the sublicensor' do
    visit sublicensor_path(@sublicensor, as: $admin_user)
    wait_for_ajax
    delete_button = find('.delete-button', text: 'Delete')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/sublicensors', ignore_query: true)
    expect(Sublicensor.find_by_id(@sublicensor.id)).to be(nil)
  end

end
