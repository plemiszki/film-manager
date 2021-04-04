require 'rails_helper'
require 'support/features_helper'

describe 'purchase_orders_index', type: :feature do

  before(:each) do
    create(:dvd_customer)
    create(:shipping_address)
    create(:purchase_order)
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
    find('.new-button', text: 'Add Purchase Order').click
    fill_out_and_submit_modal({
      number: '450001',
      order_date: '1/1/2025',
      shipping_address_id: { value: 'Label', type: :select_modal }
    }, :input)
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
    find('.new-button', text: 'Add Purchase Order').click
    fill_out_and_submit_modal({
      number: ''
    }, :input)
    expect(page).to have_content "Number can't be blank"
    expect(page).to have_content "Order date is not a valid date"
  end

end
