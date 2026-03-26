class ExportBookings
  include Sidekiq::Worker

  sidekiq_options retry: false

  HEADERS = [
    "Start Date",
    "End Date",
    "Film",
    "Venue",
    "Type",
    "Status",
    "Terms",
    "Format",
    "Advance",
    "Shipping Fee",
    "Screenings",
    "Premiere",
    "Booker",
    "Billing Name",
    "Billing Address 1",
    "Billing Address 2",
    "Billing City",
    "Billing State",
    "Billing Zip",
    "Billing Country",
    "Shipping Name",
    "Shipping Address 1",
    "Shipping Address 2",
    "Shipping City",
    "Shipping State",
    "Shipping Zip",
    "Shipping Country",
    "Email",
    "Materials Sent",
    "Tracking Number",
    "Shipping Notes",
    "Delivered",
    "Box Office Received",
    "Box Office",
    "Venue Website",
    "Booking ID"
  ]

  def perform(booking_ids, time_started)
    job = Job.find_by_job_id(time_started)

    bookings = Booking.where(id: booking_ids).order(:id).includes(:film, :venue, :format)
    rows = bookings.map do |booking|
      venue = booking.venue
      [
        booking.start_date,
        booking.end_date,
        booking.film.title,
        venue.label,
        booking.booking_type,
        booking.status,
        booking.terms,
        booking.format.name,
        booking.advance.to_f,
        booking.shipping_fee.to_f,
        booking.screenings,
        booking.premiere,
        (booking.old_booker_id ? PastBooker.find(booking.old_booker_id).name : User.find(booking.booker_id).name),
        booking.billing_name,
        booking.billing_address1,
        booking.billing_address2,
        booking.billing_city,
        booking.billing_state,
        booking.billing_zip,
        booking.billing_country,
        booking.shipping_name,
        booking.shipping_address1,
        booking.shipping_address2,
        booking.shipping_city,
        booking.shipping_state,
        booking.shipping_zip,
        booking.shipping_country,
        booking.email,
        booking.materials_sent,
        booking.tracking_number,
        booking.shipping_notes,
        (booking.delivered ? 'Yes' : 'No'),
        (booking.box_office_received ? 'Yes' : 'No'),
        booking.box_office,
        venue.website,
        booking.id
      ]
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:  HEADERS,
      rows:     rows,
      job:      job,
      filename: 'bookings.xlsx'
    ).call

    job.update!(status: 'success', first_line: '', metadata: { url: public_url }, errors_text: '')
  end

end
