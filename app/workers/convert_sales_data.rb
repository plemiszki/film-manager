# Columns: Film, GL Code, Amount

class ConvertSalesData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, original_filename, digital_retailer_id, date, invoice_number)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p(job_folder)

    # read from uploaded file
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    object = s3.bucket(ENV['S3_BUCKET']).object("#{time_started}/#{original_filename}")
    object.get(response_target: Rails.root.join("tmp/#{time_started}/#{original_filename}"))
    require 'roo'
    begin
      xlsx = Roo::Spreadsheet.open(Rails.root.join("tmp/#{time_started}/#{original_filename}").to_s)
      sheet = xlsx.sheet(0)
      index = 2
      errors = []
      job.update!(first_line: "Importing Sales Report", second_line: true, current_value: 0, total_value: xlsx.last_row)
      totals = Hash.new { |hash, key| hash[key] = Hash.new(0) }
      unknown_films = []
      while index <= xlsx.last_row
        columns = sheet.row(index)
        title = columns[0].to_s.gsub('(English Subtitled)', '').strip
        film = Film.where('lower(title) = ?', title.to_s.downcase).first
        if film
          code = columns[1]
          amount = convert_amount(columns[2])
          totals[film.get_sage_id][code] += amount
        else
          a = Alias.where('lower(text) = ?', title.to_s.downcase).first
          if a
            film = a.film
            code = columns[1]
            amount = convert_amount(columns[2])
            totals[film.get_sage_id][code] += amount
          else
            unknown_films << title
          end
        end
        index += 1
        job.update!(current_value: index)
      end

      # write to new file
      require 'xlsx_writer'
      doc = XlsxWriter.new
      sheet = doc.add_sheet("Invoice")
      sheet.add_row([
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
        "Recur Frequency"
      ])

      job.update!(first_line: "Exporting Combined Sales", second_line: true, current_value: 0, total_value: totals.keys.length)
      digital_retailer = DigitalRetailer.find(digital_retailer_id)
      total_invoice_rows = 0
      totals.each do |_, value|
        value.each do |k, v|
          total_invoice_rows += 1
        end
      end
      invoice_row_index = 0
      totals.each do |sage_id, value|
        film = Film.find_from_sage_id(sage_id)
        value.each do |gl_code, amount, gl_index|
          sheet.add_row([
            digital_retailer.sage_id,
            '',
            invoice_number,
            '',
            'FALSE',
            '',
            Date.parse(date),
            '',
            '',
            '',
            '',
            'FALSE',
            digital_retailer.billing_name,
            digital_retailer.billing_address1,
            digital_retailer.billing_address2,
            digital_retailer.billing_city,
            digital_retailer.billing_state,
            digital_retailer.billing_zip,
            digital_retailer.billing_country,
            '',
            '',
            '',
            (Date.parse(date) + 30),
            '',
            '',
            'Net 30',
            '',
            '10200',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'FALSE',
            '',
            total_invoice_rows,
            invoice_row_index,
            '',
            'FALSE',
            'FALSE',
            '1',
            '',
            '',
            '',
            '',
            film.title,
            gl_code,
            '',
            (amount.fdiv(100) * -1),
            '1',
            '',
            '',
            (amount.fdiv(100) * -1),
            '', '', '', '', '',
            '1',
            '', '', '',
            sage_id
          ])
          job.update!(current_value: index)
        end
        invoice_row_index += 1
      end

      file_path = "#{job_folder}/sales.xlsx"
      FileUtils.mv doc.path, file_path
      doc.cleanup

      job.update({ first_line: "Uploading to AWS", second_line: false })
      s3 = Aws::S3::Resource.new(
        credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
        region: 'us-east-1'
      )
      bucket = s3.bucket(ENV['S3_BUCKET'])
      obj = bucket.object("#{time_started}/sales.xlsx")
      obj.upload_file(file_path, acl:'public-read')

      if unknown_films.present?
        job.update!({ done: true, errors_text: unknown_films.sort.uniq.to_json })
      else
        job.update!({ done: true, first_line: obj.public_url })
      end
    rescue
      job.update!({ done: true, errors_text: "Unable to import spreadsheet" })
    end
  end

  private

  def convert_amount(input)
    (("%.2f" % input).to_d * 100).to_i
  end
  
end
