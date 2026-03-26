class ExportVirtualBookings
  include Sidekiq::Worker

  sidekiq_options retry: false

  HEADERS = [
    "Start Date",
    "End Date",
    "Film",
    "Venue",
    "City",
    "State",
    "Terms",
    "Billing Name",
    "Billing Address 1",
    "Billing Address 2",
    "Billing City",
    "Billing State",
    "Billing Zip",
    "Billing Country",
    "Email",
    "Box Office Received",
    "Box Office",
    "Hosted By",
    "URL"
  ]

  def perform(booking_ids, time_started)
    job = Job.find_by_job_id(time_started)

    bookings = VirtualBooking.where(id: booking_ids).order(:id).includes(:film, :venue)
    rows = bookings.map do |booking|
      venue = booking.venue
      [
        booking.start_date,
        booking.end_date,
        booking.film.title,
        venue.label,
        booking.shipping_city,
        booking.shipping_state,
        booking.terms,
        booking.billing_name,
        booking.billing_address1,
        booking.billing_address2,
        booking.billing_city,
        booking.billing_state,
        booking.billing_zip,
        booking.billing_country,
        booking.email,
        (booking.box_office_received ? 'Yes' : 'No'),
        booking.box_office,
        booking.host,
        booking.url
      ]
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:  HEADERS,
      rows:     rows,
      job:      job,
      filename: 'virtual_bookings.xlsx'
    ).call

    job.update!({ status: 'success', first_line: '', metadata: { url: public_url }, errors_text: '' })
  end

end
