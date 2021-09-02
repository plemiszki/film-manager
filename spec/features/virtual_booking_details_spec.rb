require 'rails_helper'
require 'support/features_helper'

describe 'virtual_booking_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:film, title: 'Another Film')
    create(:venue)
    create(:venue, label: 'Another Venue')
    @virtual_booking = create(:virtual_booking)
  end

  it 'is gated' do
    visit virtual_booking_path(@virtual_booking)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="filmId"]').value).to eq('Wilby Wonderful')
    expect(find('input[data-field="venueId"]').value).to eq('Film at Lincoln Center')
    expect(find('input[data-field="shippingCity"]').value).to eq('New York')
    expect(find('input[data-field="shippingState"]').value).to eq('NY')
    expect(find('input[data-field="startDate"]').value).to eq(Date.today.strftime('%-m/%-d/%y'))
    expect(find('input[data-field="endDate"]').value).to eq((Date.today + 1.day).strftime('%-m/%-d/%y'))
    expect(find('input[data-field="terms"]').value).to eq('50%')
    expect(find('input[data-field="url"]').value).to eq('https://www.someurl.com')
    expect(find('input[data-field="deduction"]').value).to eq('$50.00')
  end

  it 'updates information about the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    new_info = {
      film_id: { value: 'Another Film', type: :select_modal },
      venue_id: { value: 'Another Venue', type: :select_modal},
      start_date: '1/1/20',
      end_date: '2/1/20',
      shipping_city: 'Wayland',
      shipping_state: 'MA',
      terms: '100%',
      url: 'https://www.hippothemovie.com',
      host: { value: 'Venue', type: :select },
      deduction: 100,
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @virtual_booking,
      data: new_info,
      db_data: {
        film_id: 2,
        venue_id: 2,
        start_date: Date.parse('1/1/2020'),
        end_date: Date.parse('1/2/2020'),
        host: 'Venue'
      },
      component_data: {
        deduction: '$100.00'
      }
    })
  end

  it 'validates information about the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Start date is not a valid date")
    expect(page).to have_content("End date is not a valid date")
  end

  it 'deletes the virtual_booking' do
    visit virtual_booking_path(@virtual_booking, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/virtual_bookings', ignore_query: true)
    expect(VirtualBooking.find_by_id(@virtual_booking.id)).to be(nil)
  end

end
