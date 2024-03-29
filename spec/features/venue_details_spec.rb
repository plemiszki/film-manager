require 'rails_helper'
require 'support/features_helper'

describe 'venue_details', type: :feature do

  before(:each) do
    create(:label)
    @venue = create(:venue)
    Booking.create!(
      film_id: create(:film, title: 'Wilby Wonderful').id,
      venue_id: @venue.id,
      start_date: Date.today,
      end_date: Date.today + 1.week,
      booking_type: 'Theatrical',
      status: 'Confirmed',
      date_added: Date.today,
      booker_id: 1
    )
    @no_bookings_venue = create(:venue, label: 'No Bookings Venue', sage_id: 'SAD')
  end

  it 'is gated' do
    visit venue_path(@venue)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the venue' do
    visit venue_path(@venue, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Venue Details'
    expect(find('input[data-field="label"]').value).to eq 'Film at Lincoln Center'
    expect(find('input[data-field="sageId"]').value).to eq 'LINCOLN'
    expect(find('input[data-field="website"]').value).to eq 'lincolncenter.com'
    expect(find('input[data-field="contactName"]').value).to eq 'Bobby Joe'
    expect(find('input[data-field="email"]').value).to eq 'bobby@lincolncenter.com'
    expect(find('input[data-field="phone"]').value).to eq '555-555-5555'
    expect(find('textarea[data-field="notes"]').value).to eq 'some notes'
  end

  it "displays the venue's bookings" do
    visit venue_path(@venue, as: $admin_user)
    expect(page).to have_content 'Wilby Wonderful'
  end

  it 'updates information about the venue' do
    visit venue_path(@venue, as: $admin_user)
    fill_out_form({
      label: 'New Label',
      venue_type: { value: 'Festival', type: :select },
      sage_id: 'New Sage ID',
      website: 'newwebsite.com',
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
    expect(@venue.reload.attributes).to include(
      'label' => 'New Label',
      'venue_type' => 'Festival',
      'sage_id' => 'New Sage ID',
      'website' => 'newwebsite.com',
      'contact_name' => 'Joe Schmo',
      'email' => 'joe@newwebsite.com',
      'phone' => '222-222-2222',
      'notes' => 'new notes',
      'billing_name' => 'Billing Name',
      'billing_address1' => 'Billing Address 1',
      'billing_address2' => 'Billing Address 2',
      'billing_city' => 'Billing City',
      'billing_state' => 'Billing State',
      'billing_zip' => '90210',
      'billing_country' => 'USA',
      'shipping_name' => 'Shipping Name',
      'shipping_address1' => 'Shipping Address 1',
      'shipping_address2' => 'Shipping Address 2',
      'shipping_city' => 'Shipping City',
      'shipping_state' => 'Shipping State',
      'shipping_zip' => '90210',
      'shipping_country' => 'USA'
    )
  end

  it 'validates information about the venue' do
    visit venue_path(@venue, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Label can't be blank")
  end

  it 'copies the billing address to the shipping address' do
    visit venue_path(@venue, as: $admin_user)
    fill_out_form({
      billing_name: 'Billing Name',
      billing_address_1: 'Billing Address 1',
      billing_address_2: 'Billing Address 2',
      billing_city: 'Billing City',
      billing_state: 'Billing State',
      billing_zip: '90210',
      billing_country: 'USA'
    })
    click_btn("Copy to Shipping Address")
    expect(find('input[data-field="shippingName"]').value).to eq('Billing Name')
    expect(find('input[data-field="shippingAddress1"]').value).to eq('Billing Address 1')
    expect(find('input[data-field="shippingAddress2"]').value).to eq('Billing Address 2')
    expect(find('input[data-field="shippingCity"]').value).to eq('Billing City')
    expect(find('input[data-field="shippingState"]').value).to eq('Billing State')
    expect(find('input[data-field="shippingZip"]').value).to eq('90210')
    expect(find('input[data-field="shippingCountry"]').value).to eq('USA')
  end

  it 'splits a billing address' do
    visit venue_path(@venue, as: $admin_user)
    find('.address-block img', match: :first).click
    within('.shredder-modal') do
      find('textarea').set("Shredded Name\nShredded Address 1\nShredded Address 2\nShredded City, MA 01778")
      click_btn('Split Address')
    end
    expect(find('input[data-field="billingName"]').value).to eq('Shredded Name')
    expect(find('input[data-field="billingAddress1"]').value).to eq('Shredded Address 1')
    expect(find('input[data-field="billingAddress2"]').value).to eq('Shredded Address 2')
    expect(find('input[data-field="billingCity"]').value).to eq('Shredded City')
    expect(find('input[data-field="billingState"]').value).to eq('MA')
    expect(find('input[data-field="billingZip"]').value).to eq('01778')
    expect(find('input[data-field="billingCountry"]').value).to eq('USA')
  end

  it 'deletes venues with no bookings' do
    visit venue_path(@no_bookings_venue, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/venues', ignore_query: true)
    expect(Venue.find_by_id(@no_bookings_venue.id)).to be(nil)
  end

  it 'errors on delete for venues with bookings' do
    visit venue_path(@venue, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content 'This venue cannot be deleted because there are bookings associated with it.'
  end

end
