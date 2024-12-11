include InvoiceImportHelper

class ExportInvoices
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
  sidekiq_options retry: false

  def perform(invoice_ids, time_started)
    errors = []
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")
    file_path = "#{job_folder}/invoices.xlsx"

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Invoices") do |sheet|
        add_row(sheet, COLUMN_HEADERS)
        invoices = Invoice.where(id: invoice_ids).order(:id)
        invoices.each_with_index do |invoice, invoice_index|
          items = invoice.invoice_rows
          items.each_with_index do |item, index|
            rowData = CONSTANT_DATA.merge({
              "Invoice/CM #": invoice.number,
              "Invoice/CM Distribution": index,
              "Number of Distributions": items.length,
              "Date": invoice.sent_date,
              "Ship to Name": invoice.shipping_name,
              "Ship to Address-Line One": invoice.shipping_address1,
              "Ship to Address-Line Two": invoice.shipping_address2,
              "Ship to City": invoice.shipping_city,
              "Ship to State": invoice.shipping_state,
              "Ship to Zipcode": invoice.shipping_zip,
              "Ship to Country": invoice.shipping_country,
              "Customer PO": invoice.po_number,
              "Quantity": item.item_qty,
              "Unit Price": (item.unit_price * -1),
              "Amount": (item.total_price * -1),
            })

            case invoice.invoice_type
            when 'dvd'
              rowData = rowData.merge({
                "Customer ID": invoice.customer.sage_id,
                "Date Due": invoice.sent_date + invoice.payment_terms,
                "Displayed Terms": "Net #{invoice.payment_terms}",
                "Description": item.item_label,
                "G/L Account": "30200",
                "Job ID": (item.item_type == 'dvd' ? Film.find(item.item_id).get_sage_id : Giftbox.find(item.item_id).sage_id),
              })
            when 'booking'
              booking = invoice.booking
              unless booking
                errors << "Missing Booking for Invoice #{invoice.number}"
                next
              end
              booking_venue = booking.venue
              booking_film = booking.film
              booking_gl_code = get_gl_code(booking)
              errors << "No Sage ID for #{booking_venue.label}" if booking_venue.sage_id.empty?
              is_shipping_fee = item.item_label == 'Shipping Fee'
              rowData = rowData.merge({
                "Customer ID": booking_venue.sage_id,
                "Date Due": invoice.sent_date + 30,
                "Displayed Terms": "Net 30",
                "Description": "#{booking_film.title} #{booking.start_date.strftime("%-m/%-d/%Y")} - #{booking.end_date.strftime("%-m/%-d/%Y")}",
                "G/L Account": is_shipping_fee ? '40069' : booking_gl_code,
                "Job ID": is_shipping_fee ? '' : booking_film.get_sage_id,
              })
            when 'institution'
              institution = invoice.institution
              errors << "No Sage ID for #{institution.label}" if institution.sage_id.empty?
              is_shipping_fee = item.item_label == 'Shipping Fee'
              rowData = rowData.merge({
                "Customer ID": institution.sage_id,
                "Date Due": invoice.sent_date + 30,
                "Displayed Terms": "Net 30",
                "Description": item.item_label,
                "G/L Account": is_shipping_fee ? '40069' : "30440",
                "Job ID": is_shipping_fee ? '' : Film.find(item.item_id).get_sage_id,
              })
            end
            add_row(sheet, COLUMN_HEADERS.map { |column| rowData.fetch(column.to_sym, "") })
          end
          job.update({ current_value: invoice_index + 1 })
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
    obj = bucket.object("#{time_started}/invoices.xlsx")
    obj.upload_file(file_path, acl:'public-read')
    if errors.present?
      job.update!({ status: 'failed', first_line: 'Errors Found', errors_text: errors.uniq.join("\n") })
    else
      job.update!({ status: 'success', first_line: '', metadata: { url: obj.public_url }, errors_text: '' })
    end
  end

  def get_gl_code(booking)
    if booking.class == VirtualBooking || booking.booking_type == 'Theatrical'
      return '30100'
    elsif booking.booking_type == 'Festival'
      ['DVD', 'Blu-ray'].include?(booking.format.name) ? '30415' : '30410'
    elsif booking.booking_type == 'Non-Theatrical'
      ['DVD', 'Blu-ray'].include?(booking.format.name) ? '30420' : '30430'
    end
  end

end
