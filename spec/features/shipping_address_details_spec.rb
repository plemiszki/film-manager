require 'rails_helper'
require 'support/features_helper'

describe 'shipping_address_details', type: :feature do

  before(:each) do
    @dvd_customer = DvdCustomer.create!(
      name: 'DVD Customer',
      sage_id: 'Sage ID',
      payment_terms: 'payment terms',
      invoices_email: 'invoices@dvdcustomer.com',
      discount: 50,
      billing_name: 'Billing Name',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      state: 'MA',
      zip: '01778',
      country: 'Country',
      consignment: false,
      notes: 'notes'
    )
    @dvd_customer_2 = DvdCustomer.create!(
      name: 'DVD Customer 2',
      sage_id: 'Sage ID 2',
      payment_terms: 'payment terms',
      invoices_email: 'invoices@dvdcustomer.com',
      discount: 50,
      billing_name: 'Billing Name',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      state: 'MA',
      zip: '01778',
      country: 'Country',
      consignment: false,
      notes: 'notes'
    )
    @shipping_address = ShippingAddress.create!(
      label: 'Label',
      name: 'Name',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      state: 'MA',
      zip: '01778',
      country: 'Country',
      customer_id: @dvd_customer.id
    )
  end

  it 'is gated' do
    visit shipping_address_path(@shipping_address)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the shipping address' do
    visit shipping_address_path(@shipping_address, as: $admin_user)
    expect(page).to have_content 'Shipping Address Details'
    expect(find('input[data-field="label"]').value).to eq 'Label'
    expect(find('input[data-field="name"]').value).to eq 'Name'
    expect(find('input[data-field="address1"]').value).to eq 'Address 1'
    expect(find('input[data-field="address2"]').value).to eq 'Address 2'
    expect(find('input[data-field="city"]').value).to eq 'City'
    expect(find('input[data-field="state"]').value).to eq 'MA'
    expect(find('input[data-field="zip"]').value).to eq '01778'
    expect(find('input[data-field="country"]').value).to eq 'Country'
    expect(find('select[data-field="customerId"]', visible: false).value).to eq '1'
  end

  it 'updates information about the shipping address' do
    visit shipping_address_path(@shipping_address, as: $admin_user)
    fill_out_form({
      label: 'New Label',
      name: 'New Name',
      address1: 'New Address 1',
      address2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country',
      customerId: { value: 2, type: :select }
    })
    save_and_wait
    expect(@shipping_address.reload.attributes).to include(
      'label' => 'New Label',
      'name' => 'New Name',
      'address1' => 'New Address 1',
      'address2' => 'New Address 2',
      'city' => 'New City',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'New Country',
      'customer_id' => 2
    )
  end

  it 'validates information about the shipping address' do
    visit shipping_address_path(@shipping_address, as: $admin_user)
    fill_out_form({
      label: ''
    })
    save_and_wait
    expect(page).to have_content("Label can't be blank")
  end

  it 'deletes the licensor' do
    visit shipping_address_path(@shipping_address, as: $admin_user)
    delete_button = find('.orange-button', text: 'Delete Shipping Address')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/shipping_addresses', ignore_query: true)
    expect(ShippingAddress.find_by_id(@shipping_address.id)).to be(nil)
  end

end
