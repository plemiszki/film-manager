require 'rails_helper'
require 'support/features_helper'

describe 'booking_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:venue)
    create(:format)
    create(:booker_user)
    @booking = create(:booking, booker_id: 2, premiere: 'New York', deduction: 50)
  end

  it 'is gated' do
    visit booking_path(@booking)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the booking' do
    visit booking_path(@booking, as: $admin_user)
    expect(find('input[data-field="filmId"]').value).to eq('Wilby Wonderful')
    expect(find('input[data-field="venueId"]').value).to eq('Film at Lincoln Center')
    expect(find('input[data-field="startDate"]').value).to eq(Date.today.strftime('%-m/%-d/%y'))
    expect(find('input[data-field="endDate"]').value).to eq((Date.today + 1.day).strftime('%-m/%-d/%y'))
    expect(find('select[data-field="bookingType"]', visible: false).value).to eq('Theatrical')
    expect(find('select[data-field="status"]', visible: false).value).to eq('Confirmed')
    expect(find('input[data-field="screenings"]').value).to eq('1')
    expect(find('input[data-field="email"]').value).to eq('someone@somevenue.com')
    expect(find('select[data-field="bookerId"]', visible: false).value).to eq('2')
    expect(find('input[data-field="premiere"]').value).to eq('New York')
    expect(find('input[data-field="advance"]').value).to eq('$100.00')
    expect(find('input[data-field="shippingFee"]').value).to eq('$15.00')
    expect(find('input[data-field="deduction"]').value).to eq('$50.00')
    expect(find('input[data-field="terms"]').value).to eq('50%')
    expect(find('input[data-field="billingName"]').value).to eq('Film Society of Lincoln Center')
    expect(find('input[data-field="billingAddress1"]').value).to eq('165 West 65th St')
    expect(find('input[data-field="billingAddress2"]').value).to eq('4th Fl')
    expect(find('input[data-field="billingCity"]').value).to eq('New York')
    expect(find('input[data-field="billingState"]').value).to eq('NY')
    expect(find('input[data-field="billingZip"]').value).to eq('10024')
    expect(find('input[data-field="billingCountry"]').value).to eq('USA')
    expect(find('input[data-field="shippingName"]').value).to eq('New York Film Festival')
    expect(find('input[data-field="shippingAddress1"]').value).to eq('The Film Society of Lincoln Center')
    expect(find('input[data-field="shippingAddress2"]').value).to eq('70 Lincoln Center Plaza')
    expect(find('input[data-field="shippingCity"]').value).to eq('New York')
    expect(find('input[data-field="shippingState"]').value).to eq('NY')
    expect(find('input[data-field="shippingZip"]').value).to eq('10023')
    expect(find('input[data-field="shippingCountry"]').value).to eq('USA')
    expect(find('textarea[data-field="notes"]').value).to eq('some notes')
    expect(find('input[data-field="materialsSent"]').value).to eq((Date.today - 1.week).strftime('%-m/%-d/%y'))
    expect(find('input[data-field="trackingNumber"]').value).to eq('123456789')
    expect(find('input[data-field="shippingNotes"]').value).to eq('some shipping notes')
    expect(find('input[data-field="boxOffice"]').value).to eq('$1,000.00')
  end

  it 'updates information about the booking' do
    create(:film, title: 'Another Film')
    create(:venue, label: 'Another Venue')
    create(:booker_user, name: 'Jimmy Weaver', email: 'jimmy@filmmovement.com')
    create(:format, name: 'DVD')
    visit booking_path(@booking, as: $admin_user)
    new_info = {
      film_id: { value: 'Another Film', type: :select_modal },
      venue_id: { value: 'Another Venue', type: :select_modal },
      start_date: (Date.today + 1.week).strftime('%-m/%-d/%y'),
      end_date: (Date.today + 1.day + 1.week).strftime('%-m/%-d/%y'),
      booking_type: { value: 'Non-Theatrical', type: :select },
      screenings: 2,
      email: 'someoneelse@venue.com',
      booker_id: { label: 'Jimmy Weaver', type: :select },
      format_id: { label: 'DVD', type: :select },
      premiere: 'Atlanta',
      advance: '$200',
      shipping_fee: '$15',
      deduction: '$25',
      terms: '75%',
      billing_name: 'new billing name',
      billing_address1: 'new billing address 1',
      billing_address2: 'new billing address 2',
      billing_city: 'new billing city',
      billing_state: 'new billing state',
      billing_zip: 'new billing zip',
      billing_country: 'new billing country',
      shipping_name: 'new shipping name',
      shipping_address1: 'new shipping address 1',
      shipping_address2: 'new shipping address 2',
      shipping_city: 'new shipping city',
      shipping_state: 'new shipping state',
      shipping_zip: 'new shipping zip',
      shipping_country: 'new shipping country',
      notes: 'more notes!',
      materials_sent: (Date.today - 2.weeks).strftime('%-m/%-d/%y'),
      tracking_number: '987654321',
      shipping_notes: 'new shipping notes',
      box_office: '2000',
      exclude_from_bo_requests: { value: true, type: :checkbox }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @booking,
      data: new_info,
      db_data: {
        film_id: 2,
        venue_id: 2,
        booker_id: 3,
        format_id: 2,
        start_date: Date.today + 1.week,
        end_date: Date.today + 1.day + 1.week,
        advance: 200,
        shipping_fee: 15,
        deduction: 25,
        materials_sent: Date.today - 2.weeks,
        box_office: 2000
      },
      component_data: {
        booker_id: '3',
        format_id: '2',
        advance: '$200.00',
        shipping_fee: '$15.00',
        deduction: '$25.00',
        box_office: '$2,000.00'
      }
    })
  end

  it 'validates information about the booking' do
    visit booking_path(@booking, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content('Start date is not a valid date')
    expect(page).to have_content('End date is not a valid date')
    expect(page).to have_content('Advance is not a number')
    expect(page).to have_content('Shipping fee is not a number')
    expect(page).to have_content('Deduction is not a number')
    expect(page).to have_content('Box office is not a number')
  end

  it 'displays weekly terms' do

  end

  it 'adds weekly terms' do

  end

  it 'removes weekly terms' do

  end

  it 'displays weekly box office returns' do

  end

  it 'adds weekly box office returns' do

  end

  it 'removes weekly box office returns' do

  end

  it 'displays invoices' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'adds invoices' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'edits invoices' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'removes invoices?' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'displays payments' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'adds payments' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'removes payments' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'sends booking confirmations' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'calculates bookings' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'copies bookings' do
    visit booking_path(@booking, as: $admin_user)
  end

  it 'deletes bookings' do
    visit booking_path(@booking, as: $admin_user)
  end

end
