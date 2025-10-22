class CreateReportsSummary
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  include ExportSpreadsheetHelpers
  include AwsUpload

  sidekiq_options retry: false

  COLUMN_NAMES = [
    'Title',
    'Licensor',
    'Owed',
    'Reserves Liquated This Quarter',
    'Remaining Reserves'
  ]

  def perform(quarter, year, days_due, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    file_path = "#{job_folder}/Reports Summary.xlsx"
    FileUtils.mkdir_p("#{job_folder}")

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(nane: "Films") do |sheet|
        add_row(sheet, COLUMN_NAMES)

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
          add_row(sheet, [
            film.title,
            film.licensor.try(:name) || '(None)',
            report.joined_amount_due,
            reserves_breakdown[quarter_string]['liquidated_this_quarter'],
            reserves_breakdown[quarter_string]['total_reserves']
          ])
          job.update({ current_value: job.current_value + 1 })
        end

        job.update({ first_line: 'Saving Spreadsheet', second_line: false })
        p.serialize(file_path)
      end
    end

    job.update({ first_line: 'Uploading to AWS' })
    public_url = upload_to_aws(file_path: file_path, key: "#{time_started}/Reports Summary.xlsx")

    job.update!({ status: :success, metadata: { url: public_url } })
  end

end
