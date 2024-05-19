require 'rails_helper'
require 'support/features_helper'

describe 'licensor_details', type: :feature do

  before(:each) do
    @licensor = Licensor.create!(name: 'Visit Films', email: 'ryan@visitfilms.com', sage_id: 'VISIT')
    create(:label)
    create(:film, title: 'Some Film From This Licensor', licensor_id: @licensor.id)
  end

  it 'is gated' do
    visit licensor_path(@licensor)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Licensor Details'
    expect(find('input[data-field="name"]').value).to eq 'Visit Films'
    expect(find('input[data-field="email"]').value).to eq 'ryan@visitfilms.com'
    expect(find('input[data-field="sageId"]').value).to eq 'VISIT'
    expect(page).to have_content 'Some Film From This Licensor'
  end

  it 'updates information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    new_info = {
      name: 'New Name',
      email: 'newemail@visitfilms.com',
      address: "Visit Films\n1300 Main Street\nNew York, NY 10001",
      sage_id: 'VISIIIIT',
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @licensor,
      data: new_info,
    )
  end

  it 'validates information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    fill_out_form({
      name: '',
      email: '',
      address: '',
      sage_id: '',
    })
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/licensors', ignore_query: true)
    expect(Licensor.find_by_id(@licensor.id)).to be(nil)
  end

end
