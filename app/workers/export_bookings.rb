class ExportBookings
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
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
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    file_path = "#{job_folder}/bookings.xlsx"
    FileUtils.mkdir_p("#{job_folder}")

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Invoices") do |sheet|
        add_row(sheet, HEADERS)
        bookings = Booking.where(id: booking_ids).order(:id).includes(:film, :venue, :format)
        bookings.each_with_index do |booking, booking_index|
          venue = booking.venue
          add_row(sheet, [
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
          ])
          job.update({ current_value: booking_index + 1 })
        end
        p.serialize(file_path)
      end
    end

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/bookings.xlsx")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ status: 'success', first_line: '', metadata: { url: obj.public_url }, errors_text: '' })
  end

end
