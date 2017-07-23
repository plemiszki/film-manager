class ImportSageData
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(year, quarter, time_started)
    p '---------------------------'
    p 'STARTING SAGE IMPORT'
    p '---------------------------'
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.where(year: year, quarter: quarter)
    if reports.length == 0
      films = Film.where(short_film: false)
      job.update!(first_line: "Transferring Previous Revenue/Expenses", second_line: true, current_value: 0, total_value: films.length)
      films.each_with_index do |film, index|
        prev_report, prev_streams = get_prev_report(film, quarter.to_i, year.to_i)
        report = RoyaltyReport.new(film_id: film.id, deal_id: film.deal_type_id, quarter: quarter, year: year, mg: film.mg, e_and_o: film.e_and_o)
        if prev_report
          prev_amount_due = (prev_report.joined_amount_due < 0 ? 0 : prev_report.joined_amount_due)
          report.amount_paid = (prev_report.amount_paid + prev_amount_due)
          report.cume_total_expenses = prev_report.joined_total_expenses
        end
        report.save!

        calculated_streams = prev_report.calculate! if prev_report
        FilmRevenuePercentage.where(film_id: film.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
          RoyaltyRevenueStream.create(royalty_report_id: report.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: prev_report ? calculated_streams[index].joined_revenue : 22, cume_expense: prev_report ? calculated_streams[index].joined_expense : 22)
        end

        job.update!(current_value: index, total_value: films.length)
      end
    end
    job.update!({first_line: "Done!"})
    p '---------------------------'
    p 'FINISHED SAGE IMPORT'
    p '---------------------------'
  end

  def get_prev_report(film, quarter, year)
    prev_quarter = quarter - 1
    prev_year = year
    if prev_quarter == 0
      prev_quarter = 4
      prev_year -= 1
    end
    @reports = RoyaltyReport.where(film_id: film.id, year: prev_year, quarter: prev_quarter)
    return nil if @reports.empty?
    @film = film
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id).joins(:revenue_stream).order('revenue_streams.order')
    @reports[0].calculate!
    return [@reports[0], @streams]
  end
end
