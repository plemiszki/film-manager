class CalculateTotals
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(quarter, year, days_due, time_started)
    job = Job.find_by_job_id(time_started)
    errors = []
    total_due = 0
    total_due_to_send = 0
    total_reserves = 0
    if days_due == 'all'
      reports = RoyaltyReport.where(quarter: quarter, year: year).includes(:film)
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year, films: { days_statement_due: days_due }).includes(:film)
    end
    reports.each do |report|
      film = report.film
      if film.export_reports && film.send_reports && film.reserve
        total_reserves += report.current_reserve
      end
      unless report.joined_amount_due < 0
        total_due += report.joined_amount_due
        if film.export_reports && film.send_reports
          total_due_to_send += report.joined_amount_due
        end
      end
      job.update({ current_value: job.current_value + 1 })
    end
    errors << "Total Due: $#{number_with_delimiter(sprintf("%.2f", total_due.to_f), delimiter: ",")} :)"
    errors << "Total Being Sent: $#{number_with_delimiter(sprintf("%.2f", total_due_to_send.to_f), delimiter: ",")} :)"
    errors << "Total Reserves: $#{number_with_delimiter(sprintf("%.2f", total_reserves.to_f), delimiter: ",")} :)"
    job.update!({ done: true, first_line: 'Calculations Complete', errors_text: errors.join("\n") })
  end

end
