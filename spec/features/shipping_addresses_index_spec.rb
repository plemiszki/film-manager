require 'rails_helper'
require 'support/features_helper'

describe 'shipping_addresses_index', type: :feature do

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
    ShippingAddress.create!(
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
    visit shipping_addresses_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all shipping addresses' do
    visit shipping_addresses_path(as: $admin_user)
    expect(page).to have_content 'Shipping Addresses'
    expect(page).to have_content 'Label'
    expect(page).to have_content 'DVD Customer'
  end

end
