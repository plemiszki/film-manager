class ExportInvoices
  include Sidekiq::Worker
  sidekiq_options retry: false

  COLUMNS = [
    "Customer ID",
    "Customer Name",
    "Invoice/CM #",
    "Apply to Invoice Number",
    "Credit Memo",
    "Progress Billing Invoice",
    "Date",
    "Ship By",
    "Quote",
    "Quote #",
    "Quote Good Thru Date",
    "Drop Ship",
    "Ship to Name",
    "Ship to Address-Line One",
    "Ship to Address-Line Two",
    "Ship to City",
    "Ship to State",
    "Ship to Zipcode",
    "Ship to Country",
    "Customer PO",
    "Ship Via",
    "Ship Date",
    "Date Due",
    "Discount Amount",
    "Discount Date",
    "Displayed Terms",
    "Sales Representative ID",
    "Accounts Receivable Acccount",
    "Accounts Receivable Amount",
    "Sales Tax ID",
    "Invoice Note",
    "Note Prints After Line Items",
    "Statement Note",
    "Stmt Note Prints Before Ref",
    "Internal Note",
    "Beginning Balance Transaction",
    "AR Date Cleared in Bank Rec",
    "Number of Distributions",
    "Invoice/CM Distribution",
    "Apply to Invoice Distribution",
    "Apply to Sales Order",
    "Apply to Proposal",
    "Quantity",
    "SO/Proposal Number",
    "Item ID",
    "Serial Number",
    "SO/Proposal Distribution",
    "Description",
    "G/L Account",
    "GL Date Cleared in Bank Rec",
    "Unit Price",
    "Tax Type",
    "UPC / SKU",
    "Weight",
    "Amount",
    "Inventory Account",
    "Inv Acnt Date Cleared In Bank Rec",
    "Cost of Sales Account",
    "COS Acnt Date Cleared In Bank Rec",
    "U/M ID",
    "U/M No. of Stocking Units",
    "Stocking Quantity",
    "Stocking Unit Price",
    "Cost of Sales Amount",
    "Job ID",
    "Sales Tax Agency ID",
    "Transaction Period",
    "Transaction Number",
    "Receipt Number",
    "Return Authorization",
    "Voided by Transaction",
    "Retainage Percent",
    "Recur Number",
    "Recur Frequency",
  ]

  CONSTANT_DATA = {
    "Credit Memo": "FALSE",
    "Drop Ship": "FALSE",
    "Accounts Receivable Acccount": "10200",
    "Beginning Balance Transaction": "FALSE",
    "Apply to Sales Order": "FALSE",
    "Apply to Proposal": "FALSE",
    "Tax Type": "1",
    "U/M No. of Stocking Units": "1",
  }

  def perform(invoice_ids, time_started)
    errors = []
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet("Invoices")
    sheet.add_row(COLUMNS)

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
          rowData.merge({
            "Customer ID": { type: :String, value: invoice.customer.sage_id },
            "Date Due": invoice.sent_date + invoice.payment_terms,
            "Displayed Terms": "Net #{invoice.payment_terms}",
            "Description": { type: :String, value: item.item_label },
            "G/L Account": "30200",
            "Job ID": { type: :String, value: (item.item_type == 'dvd' ? Film.find(item.item_id).get_sage_id : Giftbox.find(item.item_id).sage_id) },
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
          rowData.merge({
            "Customer ID": { type: :String, value: booking_venue.sage_id },
            "Date Due": invoice.sent_date + 30,
            "Displayed Terms": "Net 30",
            "Description": { type: :String, value: "#{booking_film.title} #{booking.start_date.strftime("%-m/%-d/%Y")} - #{booking.end_date.strftime("%-m/%-d/%Y")}" },
            "G/L Account": item.item_label == 'Shipping Fee' ? '40069' : booking_gl_code,
            "Job ID": { type: :String, value: item.item_label == 'Shipping Fee' ? '' : booking_film.get_sage_id },
          })
        when 'institution'
          institution = invoice.institution
          errors << "No Sage ID for #{institution.label}" if institution.sage_id.empty?
          rowData.merge({
            "Customer ID": { type: :String, value: institution.sage_id },
            "Date Due": invoice.sent_date + 30,
            "Displayed Terms": "Net 30",
            "Description": { type: :String, value: item.item_label },
            "G/L Account": "30440",
            "Job ID": { type: :String, value: item.item_label == 'Shipping Fee' ? '' : Film.find(item.item_id).get_sage_id },
          })
        end
        sheet.add_row(COLUMNS.map { |column| rowData.fetch(column, "") })
      end
      job.update({ current_value: invoice_index + 1 })
    end

    file_path = "#{job_folder}/invoices.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

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
