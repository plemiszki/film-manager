class ErrorCheck
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(quarter, year, time_started)
    job = Job.find_by_job_id(time_started)
    errors = []
    reports = RoyaltyReport.where(quarter: quarter, year: year)
    reports.each do |report|
      streams = report.royalty_revenue_streams
      streams.each do |stream|
        if (stream.current_revenue > 0 || stream.current_expense > 0) && stream.licensor_percentage == 0
          rev_stream = RevenueStream.find(stream.revenue_stream_id)
          stream_name = rev_stream.nickname || rev_stream.name
          message = "Revenue/Expenses were added to #{stream_name} for \"#{report.film.title}\", but percentage is zero."
          errors << message unless errors.include?(message)
        end
      end
      job.update({current_value: job.current_value + 1})
    end
    job.update!({done: true, first_line: "No Errors Found", errors_text: errors.empty? ? "" : errors.join("\n")})
  end
end
