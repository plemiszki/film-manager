class CreateReportsSummary
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(quarter, year, days_due, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet('Films')
    column_names = [
      'Title',
      'Licensor',
      'Owed',
      'Reserves Liquated This Quarter',
      'Remaining Reserves'
    ]
    sheet.add_row(column_names)

    if days_due == 'all'
      reports = RoyaltyReport.where(quarter: quarter, year: year).includes(:film)
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { days_statement_due: days_due }).includes(film: [:licensor])
    end
    reports = reports.to_a.sort_by { |report| report.film.title }
    reports.each do |report|
      film = report.film
      reserves_breakdown = report.get_reserves_breakdown
      quarter_string = "Q#{report.quarter} #{report.year}"
      sheet.add_row([
        film.title,
        film.licensor.try(:name) || '(None)',
        report.joined_amount_due,
        reserves_breakdown[quarter_string]['liquidated_this_quarter'],
        reserves_breakdown[quarter_string]['total_reserves']
      ])
      job.update({ current_value: job.current_value + 1 })
    end

    file_path = "#{job_folder}/Reports Summary.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    job.update({ first_line: 'Uploading to AWS' })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/Reports Summary.xlsx")
    obj.upload_file(file_path, acl:'public-read')

    job.update!({ done: true, first_line: obj.public_url })
  end

end
