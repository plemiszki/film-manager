require 'rails_helper'
require 'support/features_helper'

describe 'institution_details', type: :feature do

  before(:each) do
    @institution = create(:institution)
  end

  it 'is gated' do
    visit institution_path(@institution)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the institution' do
    visit institution_path(@institution, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Institution Details'
    expect(find('input[data-field="label"]').value).to eq 'Harvard University'
    expect(find('input[data-field="sageId"]').value).to eq 'HARVARD'
    expect(find('input[data-field="contactName"]').value).to eq 'Bobby Joe'
    expect(find('input[data-field="email"]').value).to eq 'bobby@harvarduniversity.com'
    expect(find('input[data-field="phone"]').value).to eq '555-555-5555'

    expect(find('input[data-field="billingName"]').value).to eq 'Harvard University'
    expect(find('input[data-field="billingAddress1"]').value).to eq 'Massachusetts Hall'
    expect(find('input[data-field="billingAddress2"]').value).to eq ''
    expect(find('input[data-field="billingCity"]').value).to eq 'Cambridge'
    expect(find('input[data-field="billingState"]').value).to eq 'MA'
    expect(find('input[data-field="billingZip"]').value).to eq '02138'
    expect(find('input[data-field="billingCountry"]').value).to eq 'USA'

    expect(find('input[data-field="shippingName"]').value).to eq 'Harvard University'
    expect(find('input[data-field="shippingAddress1"]').value).to eq '200 Harvard Yard Mail Center'
    expect(find('input[data-field="shippingAddress2"]').value).to eq '1 Oxford Street'
    expect(find('input[data-field="shippingCity"]').value).to eq 'Cambridge'
    expect(find('input[data-field="shippingState"]').value).to eq 'MA'
    expect(find('input[data-field="shippingZip"]').value).to eq '02138'
    expect(find('input[data-field="shippingCountry"]').value).to eq 'USA'

    expect(find('textarea[data-field="notes"]').value).to eq 'some notes'
  end

  it 'updates information about the institution' do
    visit institution_path(@institution, as: $admin_user)
    fill_out_form({
      label: 'New Label',
      sage_id: 'New Sage ID',
      contact_name: 'Joe Schmo',
      email: 'joe@newwebsite.com',
      phone: '222-222-2222',
      notes: 'new notes',
      billing_name: 'Billing Name',
      billing_address_1: 'Billing Address 1',
      billing_address_2: 'Billing Address 2',
      billing_city: 'Billing City',
      billing_state: 'Billing State',
      billing_zip: '90210',
      billing_country: 'USA',
      shipping_name: 'Shipping Name',
      shipping_address_1: 'Shipping Address 1',
      shipping_address_2: 'Shipping Address 2',
      shipping_city: 'Shipping City',
      shipping_state: 'Shipping State',
      shipping_zip: '90210',
      shipping_country: 'USA'
    })
    save_and_wait
    expect(@institution.reload.attributes).to include(
      'label' => 'New Label',
      'sage_id' => 'New Sage ID',
      'contact_name' => 'Joe Schmo',
      'email' => 'joe@newwebsite.com',
      'phone' => '222-222-2222',
      'notes' => 'new notes',
      'billing_name' => 'Billing Name',
      'billing_address_1' => 'Billing Address 1',
      'billing_address_2' => 'Billing Address 2',
      'billing_city' => 'Billing City',
      'billing_state' => 'Billing State',
      'billing_zip' => '90210',
      'billing_country' => 'USA',
      'shipping_name' => 'Shipping Name',
      'shipping_address_1' => 'Shipping Address 1',
      'shipping_address_2' => 'Shipping Address 2',
      'shipping_city' => 'Shipping City',
      'shipping_state' => 'Shipping State',
      'shipping_zip' => '90210',
      'shipping_country' => 'USA'
    )
  end

  it 'validates information about the institution' do
    visit institution_path(@institution, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Label can't be blank")
  end

  it 'deletes institutions' do
    visit institution_path(@institution, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/institutions', ignore_query: true)
    expect(Institution.find_by_id(@institution.id)).to be(nil)
  end

end
