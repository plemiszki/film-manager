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
    wait_for_ajax
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
      exclude_from_bo_requests: { value: true, type: :switch }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
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
      },
    )
    expect(find('input[data-field="totalGross').value).to eq("$2,000.00")
    expect(find('input[data-field="ourShare').value).to eq("$1,490.00")
    expect(find('input[data-field="received').value).to eq("$0.00")
    expect(find('input[data-field="owed').value).to eq("$1,490.00")
  end

  it 'validates information about the booking' do
    visit booking_path(@booking, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Start date can't be blank")
    expect(page).to have_content("End date can't be blank")
    expect(page).to have_content('Advance is not a number')
    expect(page).to have_content('Shipping fee is not a number')
    expect(page).to have_content('Deduction is not a number')
    expect(page).to have_content('Box office is not a number')
  end

  it 'displays weekly terms' do
    @booking.update(terms_change: true)
    create(:weekly_term)
    create(:weekly_term, terms: '30%')
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("weekly-terms")) do
      expect(page).to have_content('40%')
      expect(page).to have_content('30%')
    end
  end

  it 'adds weekly terms' do
    @booking.update(terms_change: true)
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Week")
    fill_out_and_submit_modal({
      terms: '20%'
    }, :input)
    wait_for_ajax
    within(list_box_selector("weekly-terms")) do
      expect(page).to have_content('20%')
    end
  end

  it 'validates weekly terms' do
    @booking.update(terms_change: true)
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Week")
    fill_out_and_submit_modal({}, :input)
    wait_for_ajax
    within('.admin-modal') do
      expect(page).to have_content("Terms can't be blank")
    end
  end

  it 'removes weekly terms' do
    @booking.update(terms_change: true)
    create(:weekly_term)
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("weekly-terms")) do
      find('.x-gray-circle').click
    end
    wait_for_ajax
    within(list_box_selector("weekly-terms")) do
      expect(page).to have_no_content('40%')
    end
  end

  it 'displays weekly box office returns' do
    @booking.update(terms_change: true)
    2.times do |index|
      create(:weekly_term)
      create(:weekly_box_office, amount: 100 * (index + 1), order: index)
    end
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("weekly-box-offices")) do
      expect(page).to have_content('Week 1 - $100.00')
      expect(page).to have_content('Week 2 - $200.00')
    end
  end

  it 'adds weekly box office returns' do
    @booking.update(terms_change: true)
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Weekly Box Office")
    fill_out_and_submit_modal({
      amount: '500'
    }, :input)
    wait_for_ajax
    within(list_box_selector("weekly-box-offices")) do
      expect(page).to have_content('Week 1 - $500.00')
    end
  end

  it 'validates weekly box office returns' do
    @booking.update(terms_change: true)
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Weekly Box Office")
    fill_out_and_submit_modal({}, :input)
    wait_for_ajax
    within('.admin-modal') do
      expect(page).to have_content("Amount can't be blank")
    end
    fill_out_and_submit_modal({ amount: 'asdf' }, :input)
    wait_for_ajax
    within('.admin-modal') do
      expect(page).to have_content("Amount is not a number")
    end
  end

  it 'removes weekly box office returns' do
    @booking.update(terms_change: true)
    create(:weekly_box_office)
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("weekly-box-offices")) do
      find('.x-gray-circle').click
    end
    wait_for_ajax
    within(list_box_selector("weekly-box-offices")) do
      expect(page).to have_no_content('Week 1 - $500.00')
    end
  end

  it 'displays invoices' do
    create(:booking_invoice)
    visit booking_path(@booking, as: $admin_user)
    within('table') do
      expect(page).to have_content('1B')
    end
  end

  it 'adds invoices' do
    create(:setting)
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Invoice")
    within('.admin-modal') do
      flip_switch('switch-0') # advance
      click_btn('Send Invoice')
    end
    wait_for_ajax
    expect(Invoice.count).to eq(1)
    expect(Invoice.first.total).to eq(100)
    expect(InvoiceRow.count).to eq(1)
    expect(InvoiceRow.first.item_label).to eq('Advance')
    expect(InvoiceRow.first.total_price).to eq(100)
    within('table') do
      expect(page).to have_content('1B')
    end
  end

  it 'edits invoices' do
    create(:booking_invoice)
    create(:invoice_row, item_label: 'Advance', unit_price: 100, total_price: 100)
    visit booking_path(@booking, as: $admin_user)
    within('table') do
      find('.edit-image').click
    end
    within('.admin-modal') do
      flip_switch('switch-0') # advance
      flip_switch('switch-2') # overage
      click_btn('Resend Invoice')
    end
    wait_for_ajax
    expect(InvoiceRow.first.item_label_export).to eq('Overage (Total Gross: $1,000.00)')
    expect(InvoiceRow.first.total_price).to eq(350)
  end

  it 'deletes invoices' do
    create(:booking_invoice)
    visit booking_path(@booking, as: $admin_user)
    within('table') do
      find('.x-gray-circle').click
    end
    click_confirm_delete
    wait_for_ajax
    within('table') do
      expect(page).to have_no_content('1B')
    end
    expect(Invoice.count).to eq(0)
  end

  it 'displays payments' do
    create(:payment)
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("payments")) do
      expect(page).to have_content("#{Date.today.strftime('%-m/%-d/%y')} - $50.00")
    end
  end

  it 'adds payments' do
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Payment")
    info = {
      date: Date.today.strftime('%-m/%-d/%y'),
      amount: 20,
      notes: 'note about payment',
    }
    fill_out_and_submit_modal(info, :input)
    wait_for_ajax
    verify_db(entity: Payment.first, data: info.merge({ date: Date.today }))
    within(list_box_selector("payments")) do
      expect(page).to have_content("#{Date.today.strftime('%-m/%-d/%y')} - $20.00")
    end
  end

  it 'validates payments' do
    visit booking_path(@booking, as: $admin_user)
    click_btn("Add Payment")
    fill_out_and_submit_modal({}, :input)
    wait_for_ajax
    within('.admin-modal') do
      expect(page).to have_content('Amount is not a number')
    end
  end

  it 'removes payments' do
    create(:booking_invoice)
    create(:payment)
    visit booking_path(@booking, as: $admin_user)
    within(list_box_selector("payments")) do
      find('.x-gray-circle').click
    end
    wait_for_ajax
    expect(Payment.count).to eq(0)
    within(list_box_selector("payments")) do
      expect(page).to have_no_content("#{Date.today.strftime('%-m/%-d/%y')} - $50.00")
    end
  end

  it 'sends booking confirmations' do
    create(:setting)
    visit booking_path(@booking, as: $admin_user)
    click_btn('Send Booking Confirmation')
    wait_for_ajax
    expect(@booking.reload.booking_confirmation_sent).to eq(Date.today)
    expect(find('input[data-field="bookingConfirmationSent"]').value).to eq(Date.today.strftime('%-m/%-d/%y'))
  end

  it 'calculates total gross' do
    visit booking_path(@booking, as: $admin_user)
    expect(find('input[data-field="totalGross"]').value).to eq('$1,000.00')
  end

  it 'calculates straight percentages' do
    @booking.update(deduction: 0)
    visit booking_path(@booking, as: $admin_user)
    expect(find('input[data-field="ourShare"]').value).to eq('$515.00')
  end

  it 'calculates advance vs percentages' do
    @booking.update(terms: '$300 vs 50%', deduction: 0)
    visit booking_path(@booking, as: $admin_user)
    expect(find('input[data-field="ourShare"]').value).to eq('$515.00')
    @booking.update(box_office: 100)
    visit booking_path(@booking, as: $admin_user)
    expect(find('input[data-field="ourShare"]').value).to eq('$315.00')
  end

  it 'copies bookings' do
    create(:film, title: 'Another Film')
    visit booking_path(@booking, as: $admin_user)
    click_btn("Copy Booking")
    fill_out_and_submit_modal({
      film_id: { value: 'Another Film', type: :select_modal }
    }, :input)
    wait_for_ajax
    expect(page).to have_current_path("/bookings/2", ignore_query: true)
    expect(Booking.count).to eq(2)
    verify_db(
      entity: Booking.last,
      data: {
        film_id: 2,
        venue_id: 1,
        booking_type: 'Theatrical',
        status: 'Confirmed',
        date_added: Date.today,
        start_date: Date.today,
        end_date: Date.today + 1.day,
        booker_id: 2,
        email: 'someone@somevenue.com',
        advance: 100,
        shipping_fee: 15,
        billing_name: 'Film Society of Lincoln Center',
        billing_address1: '165 West 65th St',
        billing_address2: '4th Fl',
        billing_city: 'New York',
        billing_state: 'NY',
        billing_zip: '10024',
        billing_country: 'USA',
        shipping_name: 'New York Film Festival',
        shipping_address1: 'The Film Society of Lincoln Center',
        shipping_address2: '70 Lincoln Center Plaza',
        shipping_city: 'New York',
        shipping_state: 'NY',
        shipping_zip: '10023',
        shipping_country: 'USA',
        notes: 'some notes',
        terms: '50%'
      }
    )
  end

  it 'deletes bookings' do
    visit booking_path(@booking, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/bookings', ignore_query: true)
    expect(Booking.find_by_id(@booking.id)).to be(nil)
  end

end
