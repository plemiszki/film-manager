require 'rails_helper'
require 'support/features_helper'

describe 'purchase_orders_index', type: :feature do

  before(:each) do
    DvdCustomer.create!(
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
      customer_id: '1'
    )
    PurchaseOrder.create!(
      number: '450000',
      order_date: Date.today,
      year: Date.today.year,
      month: Date.today.month
    )
  end

  it 'is gated' do
    visit purchase_orders_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all purchase orders' do
    visit purchase_orders_path(as: $admin_user)
    expect(page).to have_content 'DVD Purchase Orders'
    expect(page).to have_content '450000'
  end

  it 'adds new purchase orders' do
    visit purchase_orders_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      number: '450001',
      order_date: '1/1/2025',
      shipping_address_id: { value: 1, type: :select }
    }, :orange_button)
    new_po = PurchaseOrder.last
    expect(new_po.attributes).to include(
      'number' => '450001',
      'order_date' => Date.parse('1/1/2025'),
      'customer_id' => 1,
      'name' => 'Name',
      'address1' => 'Address 1',
      'address2' => 'Address 2',
      'city' => 'City',
      'state' => 'MA',
      'zip' => '01778',
      'country' => 'Country'
    )
    expect(page).to have_current_path("/purchase_orders/#{new_po.id}", ignore_query: true)
  end

  it 'validates new purchase orders properly' do
    visit purchase_orders_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      number: ''
    }, :orange_button)
    expect(page).to have_content "Number can't be blank"
    expect(page).to have_content "Order date is not a valid date"
  end

end
