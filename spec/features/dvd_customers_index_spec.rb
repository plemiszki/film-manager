require 'rails_helper'
require 'support/features_helper'

describe 'dvd_customers_index', type: :feature do

  before(:each) do
    create(:dvd_customer)
  end

  it 'is gated' do
    visit dvd_customers_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all dvd customers' do
    visit dvd_customers_path(as: $admin_user)
    expect(page).to have_content 'DVD Vendor'
  end

  it 'adds new dvd customers' do
    visit dvd_customers_path(as: $admin_user)
    click_btn('Add Dvd Customer')
    fill_out_and_submit_modal({
      name: 'New DVD Vendor',
      discount: 40,
      invoices_email: 'newinvoicesemail@dvdvendor.com',
      sage_id: 'NEW SAGE ID',
      payment_terms: '90',
      billing_name: 'New Billing Name',
      address_1: 'New Address 1',
      address_2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country'
    }, :input)
    expect(find('table')).to have_content 'New DVD Vendor'
    expect(DvdCustomer.last.attributes).to include(
      'name' => 'New DVD Vendor',
      'discount' => 0.4e2,
      'consignment' => false,
      'invoices_email' => 'newinvoicesemail@dvdvendor.com',
      'sage_id' => 'NEW SAGE ID',
      'payment_terms' => '90',
      'billing_name' => 'New Billing Name',
      'address1' => 'New Address 1',
      'address2' => 'New Address 2',
      'city' => 'New City',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'New Country'
    )
  end

  it 'adds new consignment dvd customers' do
    visit dvd_customers_path(as: $admin_user)
    click_btn('Add Dvd Customer')
    fill_out_and_submit_modal({
      name: 'New DVD Vendor',
      discount: 40,
      consignment: { value: true, type: :switch },
      billing_name: 'New Billing Name',
      address_1: 'New Address 1',
      address_2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country'
    }, :input)
    expect(find('table')).to have_content 'New DVD Vendor'
    expect(DvdCustomer.last.attributes).to include(
      'name' => 'New DVD Vendor',
      'discount' => 0.4e2,
      'consignment' => true,
      'billing_name' => 'New Billing Name',
      'address1' => 'New Address 1',
      'address2' => 'New Address 2',
      'city' => 'New City',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'New Country'
    )
  end

  it 'validates new dvd customers properly' do
    visit dvd_customers_path(as: $admin_user)
    click_btn('Add Dvd Customer')
    fill_out_and_submit_modal({
      name: ''
    }, :input)
    expect(page).to have_content "Name can't be blank"
    expect(page).to have_content "Invoices email can't be blank"
    expect(page).to have_content "Sage can't be blank"
    expect(page).to have_content "Payment terms can't be blank"
    expect(page).to have_content "Billing name can't be blank"
    expect(page).to have_content "Address1 can't be blank"
    expect(page).to have_content "City can't be blank"
    expect(page).to have_content "State can't be blank"
    expect(page).to have_content "Zip can't be blank"
    expect(page).to have_content "Country can't be blank"
  end

end
