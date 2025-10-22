class ExportVirtualBookings
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
  include AwsUpload

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
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")
    file_path = "#{job_folder}/virtual_bookings.xlsx"

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Invoices") do |sheet|
        add_row(sheet, HEADERS)
        bookings = VirtualBooking.where(id: booking_ids).order(:id).includes(:film, :venue)
        bookings.each_with_index do |booking, booking_index|
          venue = booking.venue
          add_row(sheet, [
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
          ])
          job.update({ current_value: booking_index + 1 })
        end
        p.serialize(file_path)
      end
    end

    public_url = upload_to_aws(file_path: file_path, key: "#{time_started}/virtual_bookings.xlsx")

    job.update!({ status: 'success', first_line: '', metadata: { url: public_url }, errors_text: '' })
  end

end
