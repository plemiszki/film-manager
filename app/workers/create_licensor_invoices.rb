include InvoiceImportHelper

class CreateLicensorInvoices
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  FILENAME = "Licensor Invoices.xlsx"

  def perform(quarter, year, days_due, time_started)

    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    if days_due == 'all'
      reports = RoyaltyReport.where(quarter: quarter, year: year).includes(:film)
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { days_statement_due: days_due }).includes(film: [:licensor])
    end

    amount_due_reports = reports.where('joined_amount_due > 0')
    job.update({ second_line: true, total_value: amount_due_reports.count })

    sorted_reports = amount_due_reports.to_a.sort_by { |report| report.film.title }

    reports_by_licensor = Hash.new { |hash, key| hash[key] = [] }
    sorted_reports.each do |report|
      reports_by_licensor[report.film.licensor_id] << report
    end

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet('Invoices')
    sheet.add_row(COLUMN_HEADERS)

    reports_by_licensor.each do |licensor_id, licensor_reports|
      licensor_reports.each_with_index do |report, index|
        film = report.film
        days_due = film.days_statement_due
        licensor = film.licensor
        quarter_string = "Q#{report.quarter} #{report.year}"

        rowData = CONSTANT_DATA.merge({
          "Customer ID": { type: :String, value: licensor.sage_id },
          "Invoice/CM #": quarter_string,
          "Date Due": Date.today + 30.days,
          "Description": { type: :String, value: film.title },
          "G/L Account": "49000",
          "Job ID": film.get_sage_id,
          "Invoice/CM Distribution": index + 1,
          "Number of Distributions": reports.length,
          "Date": Date.today,
          "Amount": report.joined_amount_due,
        })

        sheet.add_row(COLUMN_HEADERS.map { |column| rowData.fetch(column.to_sym, "") })
        job.update({ current_value: job.current_value + 1 })
      end
    end

    job.update({ first_line: 'Saving Spreadsheet', second_line: false })
    file_path = "#{job_folder}/#{FILENAME}"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    job.update({ first_line: 'Uploading to AWS' })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/#{FILENAME}")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ status: :success, metadata: { url: obj.public_url } })
  end

end
