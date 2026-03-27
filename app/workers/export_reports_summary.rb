class ExportReportsSummary
  include Sidekiq::Worker

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

    if days_due == 'all'
      reports = RoyaltyReport.where(quarter: quarter, year: year).includes(:film)
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { days_statement_due: days_due }).includes(film: [:licensor])
    end

    rows = reports.to_a.sort_by { |report| report.film.title }.map do |report|
      film = report.film
      reserves_breakdown = report.get_reserves_breakdown
      quarter_string = "Q#{report.quarter} #{report.year}"
      [
        film.title,
        film.licensor.try(:name) || '(None)',
        report.joined_amount_due,
        reserves_breakdown[quarter_string]['liquidated_this_quarter'],
        reserves_breakdown[quarter_string]['total_reserves']
      ]
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:  COLUMN_NAMES,
      rows:     rows,
      job:      job,
      filename: 'Reports Summary.xlsx'
    ).call

    job.update!({ status: :success, metadata: { url: public_url } })
  end

end
