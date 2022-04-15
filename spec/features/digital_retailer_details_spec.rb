require 'rails_helper'
require 'support/features_helper'

describe 'digital_retailer_details', type: :feature do

  before(:each) do
    create(:setting)
    @digtial_retailer = create(:digital_retailer)
  end

  it 'is gated' do
    visit digital_retailer_path(@digtial_retailer)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the digital retailer' do
    visit digital_retailer_path(@digtial_retailer, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('iTunes')
    expect(find('input[data-field="sageId"]').value).to eq('Apple iTns')
    expect(find('input[data-field="billingName"]').value).to eq('Apple iTunes')
    expect(find('input[data-field="billingAddress1"]').value).to eq('1 Infinite Loop')
    expect(find('input[data-field="billingAddress2"]').value).to eq('Room 1A')
    expect(find('input[data-field="billingCity"]').value).to eq('Cupertino')
    expect(find('input[data-field="billingState"]').value).to eq('CA')
    expect(find('input[data-field="billingZip"]').value).to eq('95015')
    expect(find('input[data-field="billingCountry"]').value).to eq('USA')
  end

  it 'updates information about the digital retailer' do
    visit digital_retailer_path(@digtial_retailer, as: $admin_user)
    new_info = {
      name: 'Kanopy',
      sage_id: 'new sage ID',
      billing_name: 'new billing name',
      billing_address1: 'new billing address 1',
      billing_address2: 'new billing address 2',
      billing_city: 'billing city',
      billing_state: 'NY',
      billing_zip: '11225',
      billing_country: 'new country'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @digtial_retailer,
      data: new_info,
    )
  end

  it 'validates information about the digital retailer' do
    visit digital_retailer_path(@digtial_retailer, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the digital retailer' do
    visit digital_retailer_path(@digtial_retailer, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(DigitalRetailer.find_by_id(@digtial_retailer.id)).to be(nil)
  end

end
