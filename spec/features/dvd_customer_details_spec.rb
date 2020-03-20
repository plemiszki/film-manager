require 'rails_helper'
require 'support/features_helper'

describe 'dvd_customer_details', type: :feature do

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
  end

  it 'is gated' do
    visit dvd_customer_path(@dvd_customer)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    expect(page).to have_content 'DVD Customer Details'
    expect(find('input[data-field="name"]').value).to eq 'DVD Customer'
    expect(find('input[data-field="discount"]').value).to eq '50.0'
    expect(find('input[data-field="invoicesEmail"]').value).to eq 'invoices@dvdcustomer.com'
    expect(find('input[data-field="sageId"]').value).to eq 'Sage ID'
    expect(find('input[data-field="paymentTerms"]').value).to eq 'payment terms'
    expect(find('input[data-field="billingName"]').value).to eq 'Billing Name'
    expect(find('input[data-field="address1"]').value).to eq 'Address 1'
    expect(find('input[data-field="address2"]').value).to eq 'Address 2'
    expect(find('input[data-field="city"]').value).to eq 'City'
    expect(find('input[data-field="state"]').value).to eq 'MA'
    expect(find('input[data-field="zip"]').value).to eq '01778'
    expect(find('input[data-field="country"]').value).to eq 'Country'
    expect(find('textarea[data-field="notes"]').value).to eq 'notes'
  end

  it 'updates information about a non-consignment dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    fill_out_form({
      name: 'new name',
      sage_id: 'new sage id',
      payment_terms: 'new payment terms',
      invoices_email: 'newinvoices@dvdcustomer.com',
      discount: 25,
      billing_name: 'New Billing Name',
      address1: 'New Address 1',
      address2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country',
      consignment: false,
      notes: 'new notes'
    })
    save_and_wait
    expect(@dvd_customer.reload.attributes).to include(
      'name' => 'new name',
      'sage_id' => 'new sage id',
      'payment_terms' => 'new payment terms',
      'invoices_email' => 'newinvoices@dvdcustomer.com',
      'discount' => 25,
      'billing_name' => 'New Billing Name',
      'address1' => 'New Address 1',
      'address2' => 'New Address 2',
      'city' => 'New City',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'New Country',
      'consignment' => false,
      'notes' => 'new notes'
    )
  end

  it 'updates information about a consignment dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    fill_out_form({
      name: 'new name',
      discount: 25,
      billing_name: 'New Billing Name',
      address1: 'New Address 1',
      address2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country',
      consignment: true,
      notes: 'new notes'
    })
    save_and_wait
    expect(@dvd_customer.reload.attributes).to include(
      'name' => 'new name',
      'discount' => 0.25e2,
      'billing_name' => 'New Billing Name',
      'address1' => 'New Address 1',
      'address2' => 'New Address 2',
      'city' => 'New City',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'New Country',
      'consignment' => true,
      'notes' => 'new notes'
    )
  end

end
