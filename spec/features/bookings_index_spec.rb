require 'rails_helper'
require 'support/features_helper'

describe 'bookings_index', type: :feature do

  before(:each) do |t|
    create(:label)
    create(:booker_user)
    create(:film)
    create(:film, title: 'Another Film')
    create(:venue)
    create(:venue, label: 'New York Film Festival')
    create(:format)
  end

  it 'is gated' do
    visit bookings_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays bookings' do
    create(:future_booking)
    create(:past_booking, film_id: 2, venue_id: 2)
    visit bookings_path(as: $admin_user)
    within('#bookings-index', match: :first) do
      expect(page).to have_content 'Wilby Wonderful'
      expect(page).to have_content 'Film at Lincoln Center'
      expect(page).to have_content 'Another Film'
      expect(page).to have_content 'New York Film Festival'
    end
  end

  it 'adds bookings' do
    visit bookings_path(as: $admin_user)
    find('.new-button', text: 'Add Booking').click
    info = {
      film_id: { value: 'Wilby Wonderful', type: :select_modal },
      venue_id: { value: 'Film at Lincoln Center', type: :select_modal },
      start_date: Date.today.strftime('%-m/%d/%y'),
      end_date: ((Date.today + 1.day).strftime('%-m/%d/%y')),
      booking_type: { value: 'Theatrical', type: :select },
      status: { value: 'Confirmed', type: :select },
      format_id: { value: 1, type: :select },
      terms: '50%',
      booker_id: { value: 2, type: :select }
    }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Booking.last,
      data: info.merge({ film_id: 1, venue_id: 1, start_date: Date.today, end_date: Date.today + 1.day })
    )
    expect(page).to have_current_path "/bookings/1", ignore_query: true
  end

  it 'validates new bookings' do
    visit bookings_path(as: $admin_user)
    find('.new-button', text: 'Add Booking').click
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content "Film can't be blank"
    expect(page).to have_content "Venue can't be blank"
    expect(page).to have_content 'Start date is not a valid date'
    expect(page).to have_content 'End date is not a valid date'
    expect(page).to have_content "Format can't be blank"
    expect(page).to have_content "Booker is mandatory"
  end

  it 'performs advanced searches' do
    FILMS = ['Wilby Wonderful', 'Another Film']
    VENUES = ['Film at Lincoln Center', 'New York Film Festival']
    CITIES = ['Wayland, MA', 'New York, NY']
    TYPES = ['Theatrical', 'Non-Theatrical']
    START_DATES = ['21/1/1', '21/1/2']
    ADDED_DATES = ['20/1/1', '20/1/2']
    FORMATS = ['HD File', 'Blu-ray'].each { |name| create(:format, name: name) }
    STATUSES = ['Tentative', 'Confirmed']
    FILMS.each_with_index do |film, film_index|
      VENUES.each_with_index do |venue, venue_index|
        CITIES.each do |city_text|
          TYPES.each do |type|
            START_DATES.each do |start_date|
              ADDED_DATES.each do |added_date|
                STATUSES.each do |status|
                  FORMATS.each_with_index do |format, format_index|
                    city, state = city_text.split(',').map(&:strip)
                    data = {
                      film_id: film_index + 1,
                      venue_id: venue_index + 1,
                      shipping_city: city,
                      shipping_state: state,
                      start_date: Date.parse(start_date),
                      end_date: Date.parse(start_date) + 1.day,
                      date_added: Date.parse(added_date),
                      format_id: format_index + 2,
                      booking_type: type,
                      status: status
                    }
                    create(:booking, data.merge({ box_office_received: true, materials_sent: Date.today }))
                    create(:booking, data.merge({ box_office_received: true, materials_sent: nil }))
                    create(:booking, data.merge({ box_office_received: false, materials_sent: Date.today }))
                    create(:booking, data.merge({ box_office_received: false, materials_sent: nil }))
                  end
                end
              end
            end
          end
        end
      end
    end
    sleep 2
    visit bookings_path(as: $admin_user)
    wait_for_ajax
    search_index({
      film: { value: 'Wilby Wonderful', type: :select_modal },
      venue: { value: 'Film at Lincoln Center', type: :select_modal },
      format: { value: 'Blu-ray', type: :select_modal },
      shipping_city: { value: 'Wayland' },
      shipping_state: { value: 'MA' },
      box_office_received: { label: 'No', type: :select },
      materials_sent: { label: 'No', type: :select },
      type: { labels: ['Non-Theatrical'], type: :checkboxes },
      status: { label: 'Confirmed', type: :select },
      start_date: { start: '1/2/21', end: '1/2/21', type: :date_range },
      end_date: { start: '1/3/21', end: '1/3/21', type: :date_range },
      date_added: { start: '1/2/20', end: '1/2/20', type: :date_range }
    })
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content('Wilby Wonderful').once
    expect(page).to have_content('Film at Lincoln Center').once
    expect(page).to have_content('Non-Theatrical').once
    expect(page).to have_content('Blu-ray').once
    expect(page).to have_content('Wayland').once
    expect(page).to have_content('1/2/21').once
    expect(page).to have_content('1/2/20').once
  end

  it 'starts the export job' do
    visit bookings_path(as: $admin_user)
    find('.export-button', text: 'Export').click
    expect(page).to have_content('Exporting Bookings')
  end

end
