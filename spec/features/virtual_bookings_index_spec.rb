require 'rails_helper'
require 'support/features_helper'

describe 'virtual_bookings_index', type: :feature do

  before(:each) do |t|
    create(:label)
    create(:film)
    create(:film, title: 'Another Film')
    create(:venue)
    create(:venue, label: 'Another Venue')
  end

  it 'is gated' do
    visit virtual_bookings_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all virtual bookings' do
    create(:virtual_booking)
    visit virtual_bookings_path(as: $admin_user)
    within('#virtual-bookings-index') do
      expect(page).to have_content 'Wilby Wonderful'
      expect(page).to have_content 'Film at Lincoln Center'
    end
  end

  it 'adds virtual bookings' do
    visit virtual_bookings_path(as: $admin_user)
    find('.btn', text: 'Add Virtual Booking').click
    info = {
      film_id: { value: 'Another Film', type: :select_modal },
      venue_id: { value: 'Another Venue', type: :select_modal },
      start_date: Date.today.strftime('%-m/%d/%y'),
      end_date: ((Date.today + 1.day).strftime('%-m/%d/%y')),
      terms: '50%',
      url: 'https://www.someurl.com',
      host: { value: 'Venue', type: :select }
    }
    fill_out_and_submit_modal(info, :input)
    verify_db({
      entity: VirtualBooking.last,
      data: info.merge({ film_id: 2, venue_id: 2, date_added: Date.today, start_date: Date.today, end_date: Date.today + 1, host: 'Venue' })
    })
    expect(page).to have_current_path "/virtual_bookings/1", ignore_query: true
  end

  it 'validates new virtual bookings' do
    visit virtual_bookings_path(as: $admin_user)
    find('.btn', text: 'Add Virtual Booking').click
    fill_out_and_submit_modal({ url: '' }, :input)
    expect(page).to have_content "Film can't be blank"
    expect(page).to have_content "Venue can't be blank"
    expect(page).to have_content 'Start date is not a valid date'
    expect(page).to have_content 'End date is not a valid date'
  end

  it 'starts the export job' do
    visit virtual_bookings_path(as: $admin_user)
    find('.export-button', text: 'Export').click
    expect(page).to have_content('Exporting Virtual Bookings')
  end

end
