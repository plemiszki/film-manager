require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'purchase_order_details_spec', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    create(:dvd_customer)
    create(:dvd_customer, name: 'DVD Customer 2')
    create(:shipping_address)
    @purchase_order = create(:purchase_order)
    create(:label)
    create(:film, title: 'A Movie')
    create_dvd_types
    create(:dvd)
  end

  it 'is gated' do
    visit purchase_order_path(@purchase_order)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the purchase order' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Purchase Order Details'
    expect(find('input[data-field="number"]').value).to eq '450000'
    expect(find('input[data-field="orderDate"]').value).to eq Date.today.to_s
    expect(find('input[data-field="name"]').value).to eq 'name'
    expect(find('input[data-field="address1"]').value).to eq 'address 1'
    expect(find('input[data-field="address2"]').value).to eq 'address 2'
    expect(find('input[data-field="city"]').value).to eq 'city'
    expect(find('input[data-field="state"]').value).to eq 'MA'
    expect(find('input[data-field="zip"]').value).to eq '01778'
    expect(find('input[data-field="country"]').value).to eq 'country'
    expect(find('select[data-field="customerId"]', visible: false).value).to eq '1'
    expect(find('textarea[data-field="notes"]').value).to eq 'notes'
  end

  it 'updates information about the purchase order' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    fill_out_form({
      number: 'new number',
      order_date: '2020-01-01',
      name: 'new name',
      address1: 'new address 1',
      address2: 'new address 2',
      city: 'new city',
      state: 'NY',
      zip: '10001',
      country: 'new country',
      customerId: { value: 2, type: :select },
      notes: 'new notes'
    })
    save_and_wait
    expect(@purchase_order.reload.attributes).to include(
      'number' => 'new number',
      'order_date' => Date.parse('2020-01-01'),
      'name' => 'new name',
      'address1' => 'new address 1',
      'address2' => 'new address 2',
      'city' => 'new city',
      'state' => 'NY',
      'zip' => '10001',
      'country' => 'new country',
      'customer_id' => 2,
      'notes' => 'new notes'
    )
  end

  it 'validates information about the purchase order' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Number can't be blank")
    expect(page).to have_content "Order date can't be blank"
  end

  it 'saves a shipping address' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    fill_out_form({
      name: 'saved name',
      address1: 'saved address 1',
      address2: 'saved address 2',
      city: 'saved city',
      state: 'CA',
      zip: '90210',
      country: 'saved country'
    })
    click_btn("Save Shipping Address")
    within('.admin-modal') do
      find('input[data-field="label"]').set('Saved Address')
      click_btn("Add Shipping Address", :input)
    end
    expect(page).to have_no_css('.spinner')
    expect(ShippingAddress.last.attributes).to include(
      'label' => 'Saved Address',
      'name' => 'saved name',
      'address1' => 'saved address 1',
      'address2' => 'saved address 2',
      'city' => 'saved city',
      'state' => 'CA',
      'zip' => '90210',
      'country' => 'saved country',
      'customer_id' => 1
    )
  end

  it 'uses a saved shipping address' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    click_btn("Use Saved Shipping Address")
    select_from_modal('Label')
    save_and_wait
    expect(@purchase_order.reload.attributes).to include(
      'number' => '450000',
      'order_date' => Date.today,
      'name' => 'Name',
      'address1' => 'Address 1',
      'address2' => 'Address 2',
      'city' => 'City',
      'state' => 'MA',
      'zip' => '01778',
      'country' => 'Country',
      'customer_id' => 1,
      'notes' => 'notes'
    )
  end

  it 'adds items to the purchase order' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    click_btn("Add Item")
    select_from_modal('A Movie - Retail')
    within('.content') do
      click_btn('OK', :submit)
    end
    expect(page).to have_no_css('.spinner')
    expect(@purchase_order.reload.purchase_order_items.length).to be(1)
  end

  it 'removes items from the purchase order' do
    create(:purchase_order_item)
    visit purchase_order_path(@purchase_order, as: $admin_user)
    find('.x-gray-circle').click
    expect(page).to have_no_css('.spinner')
    expect(@purchase_order.reload.purchase_order_items.length).to eq(0)
  end

  it 'deletes the purchase order' do
    visit purchase_order_path(@purchase_order, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/purchase_orders', ignore_query: true)
    expect(PurchaseOrder.find_by_id(@purchase_order.id)).to be(nil)
  end

  it 'ships the purchase order', :type => 'sidekiq' do
    create(:setting)
    Sidekiq::Testing.inline! do
      visit purchase_order_path(@purchase_order, as: $admin_user)
      click_btn('Ship Now')
      expect(page).to have_no_css('.spinner', wait: 10)
      expect(page).to have_content('Invoice and Shipping Files Sent Successfully')
      expect(@purchase_order.reload.attributes).to include(
        'ship_date' => Date.today,
        'source_doc' => '5533'
      )
      expect(Invoice.count).to eq(1)
    end
  end

end
