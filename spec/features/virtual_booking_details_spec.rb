require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'virtual_booking_details', type: :feature do

  before do
    WebMock.disable!
    Sidekiq::Testing.inline!
  end

  before(:each) do
    create(:setting)
    create(:label)
    create(:film)
    create(:film, title: 'Another Film')
    create(:venue)
    create(:venue, label: 'Another Venue')
    @virtual_booking = create(:virtual_booking) # host FM
  end

  it 'is gated' do
    visit virtual_booking_path(@virtual_booking)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about a virtual_booking hosted by FM' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="filmId"]').value).to eq('Wilby Wonderful')
    expect(find('input[data-field="venueId"]').value).to eq('Film at Lincoln Center')
    expect(find('input[data-field="shippingCity"]').value).to eq('New York')
    expect(find('input[data-field="shippingState"]').value).to eq('NY')
    expect(find('input[data-field="startDate"]').value).to eq(Date.today.strftime('%-m/%-d/%Y'))
    expect(find('input[data-field="endDate"]').value).to eq((Date.today + 1.day).strftime('%-m/%-d/%Y'))
    expect(find('input[data-field="terms"]').value).to eq('50%')
    expect(find('input[data-field="url"]').value).to eq('https://www.someurl.com')
    expect(find('input[data-field="deduction"]').value).to eq('$50.00')
    expect(find('input[data-field="boxOffice"]').value).to eq('$500.00')
    expect(find('input[data-field="boxOfficeReceived"]', visible: false).checked?).to eq(false)
    expect(find('input[data-field="email"]').value).to eq('someone@venue.com')
  end

  it 'displays information about a virtual_booking hosted by a venue' do
    @virtual_booking.update(host: 'Venue')
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="billingName"]').value).to eq('Some Venue')
    expect(find('input[data-field="billingAddress1"]').value).to eq('6 Sherman Bridge Road')
    expect(find('input[data-field="billingAddress2"]').value).to eq('Apt 2')
    expect(find('input[data-field="billingCity"]').value).to eq('Wayland')
    expect(find('input[data-field="billingState"]').value).to eq('MA')
    expect(find('input[data-field="billingZip"]').value).to eq('01778')
    expect(find('input[data-field="billingCountry"]').value).to eq('USA')
  end

  it 'validates information about the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Start date can't be blank")
    expect(page).to have_content("End date can't be blank")
  end

  it 'updates information about the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    new_info = {
      film_id: { value: 'Another Film', type: :select_modal },
      venue_id: { value: 'Another Venue', type: :select_modal},
      start_date: '1/1/2020',
      end_date: '2/1/2020',
      shipping_city: 'Wayland',
      shipping_state: 'MA',
      terms: '100%',
      url: 'https://www.hippothemovie.com',
      host: { value: 'Venue', type: :select },
      deduction: 100,
      box_office: 750,
      box_office_received: { value: true, type: :switch },
      email: 'someonenew@venue.com'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @virtual_booking,
      data: new_info,
      db_data: {
        film_id: 2,
        venue_id: 2,
        start_date: Date.parse('1/1/2020'),
        end_date: Date.parse('2/1/2020'),
        host: 'Venue'
      },
      component_data: {
        deduction: '$100.00',
        box_office: '$750.00'
      }
    )
  end

  it 'displays invoices' do
    @virtual_booking.update(host: 'Venue')
    create(:virtual_booking_invoice)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    within('table') do
      expect(page).to have_content('1B')
    end
  end

  it 'adds invoices' do
    create(:setting)
    @virtual_booking.update(host: 'Venue')
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    click_btn("Add Invoice")
    within('.admin-modal') do
      click_btn("Send Invoice")
    end
    Capybara.using_wait_time 20 do
      expect(page).to have_content('Sending Invoice')
      wait_for_ajax
    end
    expect(Invoice.count).to eq(1)
    expect(Invoice.first.total).to eq(200)
    expect(InvoiceRow.count).to eq(1)
    expect(InvoiceRow.first.item_label).to eq('Amount Due')
    expect(InvoiceRow.first.total_price).to eq(200)
    within('table') do
      expect(page).to have_content('1B')
    end
  end

  it 'edits invoices' do
    @virtual_booking.update(host: 'Venue')
    create(:setting)
    create(:virtual_booking_invoice)
    create(:invoice_row, item_label: 'Amount Due', unit_price: 100, total_price: 100)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    fill_out_form({
      box_office: 1000
    })
    save_and_wait
    within('table') do
      find('.edit-image').click
    end
    within('.admin-modal') do
      expect(page).to have_content('$100.00 → $450.00')
      click_btn("Resend Invoice")
    end
    Capybara.using_wait_time 20 do
      expect(page).to have_content('Sending Invoice')
      wait_for_ajax
    end
    expect(InvoiceRow.first.item_label).to eq('Amount Due')
    expect(InvoiceRow.first.total_price).to eq(450)
  end

  it 'deletes invoices' do
    @virtual_booking.update(host: 'Venue')
    create(:virtual_booking_invoice)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    within('table') do
      find('.x-gray-circle').click
    end
    click_confirm_delete
    wait_for_ajax
    expect(Invoice.count).to eq(0)
    within('table') do
      expect(page).to have_no_content('1B')
    end
  end

  it 'displays payments' do
    @virtual_booking.update(host: 'Venue')
    create(:virtual_booking_payment)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    within(list_box_selector("payments")) do
      expect(page).to have_content("#{Date.today.strftime('%-m/%-d/%Y')} - $50.00")
    end
  end

  it 'validates payments' do
    @virtual_booking.update(host: 'Venue')
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    click_btn("Add Payment")
    fill_out_and_submit_modal({}, :input)
    wait_for_ajax
    within('.admin-modal') do
      expect(page).to have_content('Amount is not a number')
    end
  end

  it 'adds payments' do
    @virtual_booking.update(host: 'Venue')
    create(:virtual_booking)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    click_btn("Add Payment")
    info = {
      date: Date.today.strftime('%-m/%-d/%Y'),
      amount: 20,
      notes: 'note about payment'
    }
    fill_out_and_submit_modal(info, :input)
    wait_for_ajax
    verify_db(entity: Payment.first, data: info.merge({ date: Date.today }))
    within(list_box_selector("payments")) do
      expect(page).to have_content("#{Date.today.strftime('%-m/%-d/%Y')} - $20.00")
    end
  end

  it 'deletes payments' do
    @virtual_booking.update(host: 'Venue')
    create(:virtual_booking_payment)
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    within(list_box_selector("payments")) do
      find('.x-gray-circle').click
    end
    wait_for_ajax
    expect(Payment.count).to eq(0)
    within(list_box_selector("payments")) do
      expect(page).to have_no_content("#{Date.today.strftime('%-m/%-d/%Y')} - $50.00")
    end
  end

  it 'deletes the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/virtual_bookings', ignore_query: true)
    expect(VirtualBooking.find_by_id(@virtual_booking.id)).to be(nil)
  end

  it 'starts the send email job' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    click_btn('Send Report')
    expect(page).to have_content('Sending Report')
  end

end
