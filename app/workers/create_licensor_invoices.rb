class CreateLicensorInvoices
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  include ExportSpreadsheetHelpers
  include AwsUpload

  sidekiq_options retry: false

  FILENAME = "Licensor Invoices.xlsx"

  COLUMN_HEADERS = [
    'Vendor ID',
    'Vendor Name',
    'Invoice #',
    'Apply to Invoice #',
    'Credit Memo',
    'Date',
    'Drop Ship',
    'Customer SO#',
    'Waiting on Bill',
    'Customer ID',
    'Ship to Invoice #',
    'Ship to Name',
    'Ship to Address-Line One',
    'Ship to Address-Line Two',
    'Ship to City',
    'Ship to State',
    'Ship to Zipcode',
    'Ship to Country',
    'Date Due',
    'Discount Date',
    'Discount Amount',
    'Accounts Payable Account',
    'Accounts Payable Amount',
    'Ship Via',
    'PO Note',
    'Note Prints After Line Items',
    'Beginning Balance Transaction',
    'AP Date Cleared in Bank Rec',
    'Applied to Purchase Order',
    'Number of Distributions',
    'Invoice/CM Distribution',
    'Apply to Invoice Distribution',
    'PO Number',
    'PO Distribution',
    'Quantity',
    'Stocking Quantity',
    'Item ID',
    'Serial Number',
    'U/M ID',
    'U/M No. of Stocking Units',
    'Description',
    'G/L Account',
    'GL Date Cleared in Bank Rec',
    'Unit Price',
    'Stocking Unit Price',
    'UPC/SKU',
    'Weight',
    'Amount',
    'Job ID',
    'Used for Reimbursable Expense',
    'Transaction Period',
    'Transaction Number',
    'Displayed Terms',
    'Return Authorization',
    'Row Type',
    'Recur Number',
    'Recur Frequency',
  ]

  CONSTANT_DATA = {
    'Drop Ship': "FALSE",
    'Waiting on Bill': "FALSE",
    'Note Prints After Line Items': "FALSE",
    'Beginning Balance Transaction': "FALSE",
    'Applied to Purchase Order': "FALSE",
    'Used for Reimbursable Expense': "FALSE",
    'Credit Memo': "FALSE",
    'Recur Number': 0,
    'Recur Frequency': 0,
    'Accounts Payable Account': '20100',
  }

  def perform(quarter, year, days_due, time_started)

    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    file_path = "#{job_folder}/#{FILENAME}"
    FileUtils.mkdir_p("#{job_folder}")

    if days_due == 'all'
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { export_reports: true }).includes(film: [:licensor])
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { export_reports: true,  days_statement_due: days_due }).includes(film: [:licensor])
    end

    amount_due_reports = reports.where('joined_amount_due > 0')
    job.update({ second_line: true, total_value: amount_due_reports.count })

    sorted_reports = amount_due_reports.to_a.sort_by { |report| report.film.title }

    reports_by_licensor = Hash.new { |hash, key| hash[key] = [] }
    sorted_reports.each do |report|
      reports_by_licensor[report.film.licensor_id] << report
    end

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "Invoices") do |sheet|
        add_row(sheet, COLUMN_HEADERS)
        reports_by_licensor.each do |licensor_id, licensor_reports|
          licensor_reports.each_with_index do |report, index|
            film = report.film
            days_due = film.days_statement_due
            licensor = film.licensor
            quarter_string = "Q#{report.quarter} #{report.year}"

            rowData = CONSTANT_DATA.merge({
              "Vendor ID": licensor.sage_id,
              "Invoice #": quarter_string,
              "Date Due": (Date.today + 30.days).strftime("%-m/%-d/%Y"),
              "Description": film.title,
              "G/L Account": "49000",
              "Job ID": film.get_sage_id,
              "Invoice/CM Distribution": index + 1,
              "Number of Distributions": licensor_reports.length,
              "Date": Date.today.strftime("%-m/%-d/%Y"),
              "Amount": { value: report.joined_amount_due, type: :float },
            })

            add_row(sheet, COLUMN_HEADERS.map { |column| rowData.fetch(column.to_sym, "") })
            job.update({ current_value: job.current_value + 1 })
          end
        end
        job.update({ first_line: 'Saving Spreadsheet', second_line: false })
        p.serialize(file_path)
      end
    end

    job.update({ first_line: 'Uploading to AWS' })
    public_url = upload_to_aws(file_path: file_path, key: "#{time_started}/#{FILENAME}")

    job.update!({ status: :success, metadata: { url: public_url } })
  end

end
