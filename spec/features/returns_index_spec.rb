require 'rails_helper'
require 'support/features_helper'

describe 'returns_index', type: :feature do

  before(:each) do
    DvdCustomer.create!(
      name: 'DVD Vendor',
      discount: 0.5,
      consignment: false,
      notes: 'notes',
      sage_id: 'SAGE ID',
      invoices_email: 'invoices@dvdvendor.com',
      payment_terms: '60',
      per_unit: 7.99,
      billing_name: 'Billing Name',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      state: 'MA',
      zip: '01778',
      country: 'Country'
    )
    Return.create!(number: '012345678', customer_id: 1, date: Date.today, month: Date.today.month, year: Date.today.year)
  end

  it 'is gated' do
    visit returns_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all returns' do
    visit returns_path(as: $admin_user)
    expect(page).to have_content 'DVD Returns'
    expect(page).to have_content '012345678'
    expect(page).to have_content 'DVD Vendor'
  end

  it 'adds new returns' do
    visit returns_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      customer_id: { value: 1, type: :select },
      date: Date.today,
      number: 'return order number'
    }, :orange_button)
    expect(find('.fm-admin-table')).to have_content 'return order number'
    expect(Return.last.attributes).to include(
      'customer_id' => 1,
      'date' => Date.today,
      'number' => 'return order number'
    )
  end

  it 'validates new returns properly' do
    visit returns_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      customer_id: { value: 1, type: :select }
    }, :orange_button)
    expect(page).to have_content "Number can't be blank"
    expect(page).to have_content "Date can't be blank"
  end

end
