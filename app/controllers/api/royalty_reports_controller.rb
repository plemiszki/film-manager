class Api::RoyaltyReportsController < AdminController

  include ActionView::Helpers::NumberHelper

  def index
    @reports = RoyaltyReport.includes(film: [:licensor]).where(quarter: params[:quarter], year: params[:year])
    @errors = flash[:errors] || []
    render "index.json.jbuilder"
  end

  def show
    query_data_for_show_jbuilder
    render "show.json.jbuilder"
  end

  def update
    error_present = false
    errors = {
      report: [],
      streams: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @report = RoyaltyReport.find(params[:id])
        unless @report.update(report_params)
          error_present = true
          errors[:report] = @report.errors.full_messages
        end
        RoyaltyRevenueStream.where(royalty_report_id: params[:id]).each do |royalty_revenue_stream|
          unless royalty_revenue_stream.update(revenue_stream_params(royalty_revenue_stream.id))
            error_present = true
            errors[:streams][royalty_revenue_stream.id] = royalty_revenue_stream.errors.full_messages
          end
        end
        fail if error_present
        query_data_for_show_jbuilder
        render "show.json.jbuilder"
      end
    rescue
      render json: errors, status: 422
    end
  end

  def import
    uploaded_io = params[:user][:file]
    original_filename = uploaded_io.original_filename
    time_started = Time.now.to_s
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    File.open(Rails.root.join('tmp', time_started, original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/#{original_filename}")
    obj.upload_file(Rails.root.join('tmp', time_started, original_filename), acl:'private')
    job = Job.create!(job_id: time_started, first_line: "Importing Q#{params[:quarter]} #{params[:label].capitalize}", second_line: false)
    ImportSageData.perform_async(params[:year], params[:quarter], time_started, params[:label], original_filename)
    redirect_to "/royalty_reports", flash: {sage_import_id: job.id, quarter: params[:quarter], label: params[:label]}
  end

  def error_check
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    job = Job.create!(job_id: time_started, first_line: "Checking For Errors", second_line: true, current_value: 0, total_value: total_reports.length)
    ErrorCheck.perform_async(params[:quarter], params[:year], time_started)
    render json: job
  end

  def totals
    time_started = Time.now.to_s
    if params[:days_due] == 'all'
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter])
    else
      total_reports = RoyaltyReport.where(year: params[:year], quarter: params[:quarter], films: { days_statement_due: params[:days_due] }).includes(:film)
    end
    job = Job.create!(job_id: time_started, first_line: "Calculating Totals", second_line: true, current_value: 0, total_value: total_reports.length)
    CalculateTotals.perform_async(params[:quarter], params[:year], params[:days_due], time_started)
    render json: job
  end

  def export
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    query_data_for_show_jbuilder
    report = @reports[0]
    report.export!(pathname, @streams, @films)
    File.open("#{pathname}/#{report_name(@film, @reports[0])}", 'r') do |f|
      send_data f.read, filename: report_name(@film, @reports[0])
    end
  end

  def export_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: {days_statement_due: params[:days_due], export_reports: true}, quarter: params[:quarter], year: params[:year])
    job = Job.create!(job_id: time_started, name: "export all", first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAllReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: job
  end

  def send_all
    time_started = Time.now.to_s
    total_reports = RoyaltyReport.joins(:film).where(films: {days_statement_due: params[:days_due], export_reports: true, send_reports: true}, quarter: params[:quarter], year: params[:year], date_sent: nil)
    job = Job.create!(job_id: time_started, first_line: "Exporting Reports", second_line: true, current_value: 0, total_value: total_reports.length)
    ExportAndSendReports.perform_async(params[:days_due], params[:quarter], params[:year], time_started)
    render json: job
  end

  private

  def report_name(film, report)
    "#{film.crossed_film_titles.sort.join(' -- ')} - Q#{report.quarter} #{report.year}.pdf"
  end

  def query_data_for_show_jbuilder
    @reports = RoyaltyReport.where(id: params[:id])
    @film = Film.find(@reports[0].film_id)
    crossed_film_ids = @film.crossed_films.pluck(:crossed_film_id)
    @films = Film.where(id: [@reports[0].film_id] + crossed_film_ids)
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id).includes(:revenue_stream).order('revenue_streams.order')
    calculate(@film, @reports[0], @streams)

    if crossed_film_ids.length > 0
      calculate_crossed_films_report(@films, @reports.first)
    end
  end

  def calculate_crossed_films_report(films, starting_report)
    year = starting_report.year
    quarter = starting_report.quarter
    result = RoyaltyReport.new({ id: 0, year: year, quarter: quarter, deal_id: films.first.deal_type_id, gr_percentage: films.first.gr_percentage })
    @streams = []
    RevenueStream.all.each_with_index do |revenue_stream, index|
      @streams << RoyaltyRevenueStream.new({
        id: index,
        revenue_stream_id: revenue_stream.id
      })
    end
    films.each_with_index do |film, index|
      report = RoyaltyReport.find_by(year: year, quarter: quarter, film_id: film.id)
      report_streams = report.calculate!
      result.update_attributes({
        current_total: result.current_total + report.current_total,
        current_total_revenue: result.current_total_revenue + report.current_total_revenue,
        current_total_expenses: result.current_total_expenses + report.current_total_expenses,
        current_share_minus_expenses: result.current_share_minus_expenses + report.current_share_minus_expenses,
        cume_total: result.cume_total + report.cume_total,
        cume_total_revenue: result.cume_total_revenue + report.cume_total_revenue,
        cume_total_expenses: result.cume_total_expenses + report.cume_total_expenses,
        joined_total: result.joined_total + report.joined_total,
        joined_total_revenue: result.joined_total_revenue + report.joined_total_revenue,
        joined_total_expenses: result.joined_total_expenses + report.joined_total_expenses,
        mg: result.mg + report.mg,
        e_and_o: result.e_and_o + report.e_and_o,
        amount_paid: result.amount_paid + report.amount_paid,
        amount_due: result.amount_due + report.amount_due,
        joined_amount_due: result.joined_amount_due + report.joined_amount_due,
        current_reserve: result.current_reserve + report.current_reserve,
        cume_reserve: result.cume_reserve + report.cume_reserve,
        joined_reserve: result.joined_reserve + report.joined_reserve,
        liquidated_reserve: result.liquidated_reserve + report.liquidated_reserve
      })
      report_streams.each_with_index do |report_stream, index|
        stream = @streams[index]
        stream.update_attributes({
          current_revenue: stream.current_revenue + report_stream.current_revenue,
          current_gr: stream.current_gr + report_stream.current_gr,
          current_expense: stream.current_expense + report_stream.current_expense,
          current_difference: stream.current_difference + report_stream.current_difference,
          current_licensor_share: stream.current_licensor_share + report_stream.current_licensor_share,
          cume_revenue: stream.cume_revenue + report_stream.cume_revenue,
          cume_gr: stream.cume_gr + report_stream.cume_gr,
          cume_expense: stream.cume_expense + report_stream.cume_expense,
          cume_difference: stream.cume_difference + report_stream.cume_difference,
          cume_licensor_share: stream.cume_licensor_share + report_stream.cume_licensor_share,
          joined_revenue: stream.joined_revenue + report_stream.joined_revenue,
          joined_gr: stream.joined_gr + report_stream.joined_gr,
          joined_expense: stream.joined_expense + report_stream.joined_expense,
          joined_difference: stream.joined_difference + report_stream.joined_difference,
          joined_licensor_share: stream.joined_licensor_share + report_stream.joined_licensor_share,
          licensor_percentage: report_stream.licensor_percentage, # <-- for now, i'll assume the percentages will be the same for crossed films and send them down based on the last report
        })
      end
    end
    @reports = [result]
  end

  def dollarify(input)
    input = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input[0] == "-")
      '($' + input[1..-1] + ')'
    else
      '$' + input
    end
  end

  def negafy(input)
    string = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input > 0)
      '($' + string + ')'
    else
      '$' + string[1..-1]
    end
  end

  def expense_class(report)
    report.film.deal_type_id != 1 && report.film.deal_type_id != 4
  end

  def gr_deal(report)
    report.film.deal_type_id == 5 || report.film.deal_type_id == 6
  end

  def calculate(film, report, streams)
    report.current_total_revenue = 0.00
    report.current_total_expenses = 0.00 unless film.deal_type_id == 4
    report.current_total = 0.00
    streams.each do |stream|
      stream.joined_revenue = stream.current_revenue + stream.cume_revenue
      stream.joined_expense = stream.current_expense + stream.cume_expense
      if stream.revenue_stream_id == 3 && film.reserve && stream.current_revenue != 0
        unless report.year == 2017 && report.quarter == 1 # returns against reserves didn't start until Q2 2017
          if stream.current_revenue > 0
            report.current_reserve = stream.current_revenue * (film.reserve_percentage.fdiv(100))
          else
            report.current_reserve = 0
          end
          total_past_reserves = report.get_total_past_reserves
          report.cume_reserve = total_past_reserves.values.sum
          report.liquidated_reserve = total_past_reserves.values[0..(film.reserve_quarters * -1)].sum
        end
      end
      if film.deal_type_id == 1 # No Expenses Recouped
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 2 # Expenses Recouped From Top
        stream.current_difference = stream.current_revenue - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 3 # Theatrical Expenses Recouped From Top
        if ["Theatrical", "Non-Theatrical", "Commercial Video"].include?(stream.revenue_stream.name)
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
        else
          stream.current_difference = stream.current_revenue
          stream.cume_difference = stream.cume_revenue
          stream.joined_difference = stream.joined_revenue
        end
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 4 # Expenses Recouped From Licensor Share
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 5 # GR Percentage
        stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 6 # GR Percentage Theatrical/Non-Theatrical
        if ["Theatrical", "Non-Theatrical"].include?(stream.revenue_stream.name)
          stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        else
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        end
      end

      report.current_total_revenue += stream.current_revenue
      report.current_total_expenses += stream.current_expense unless film.deal_type_id == 4
      report.current_total += stream.current_licensor_share

      report.cume_total_revenue += stream.cume_revenue
      report.cume_total_expenses += stream.cume_expense unless film.deal_type_id == 4
      report.cume_total += stream.cume_licensor_share
      report.joined_total_revenue += stream.joined_revenue
      report.joined_total_expenses += stream.joined_expense unless film.deal_type_id == 4
      report.joined_total += stream.joined_licensor_share
    end

    report.joined_reserve = report.current_reserve + report.cume_reserve

    if film.deal_type_id == 4
      report.amount_due = report.cume_total - report.cume_total_expenses - report.cume_reserve - report.e_and_o - report.mg - report.amount_paid
      report.joined_amount_due = report.joined_total - report.current_total_expenses - report.cume_total_expenses - report.joined_reserve + report.liquidated_reserve - report.e_and_o - report.mg - report.amount_paid
    else
      report.amount_due = report.cume_total - report.cume_reserve - report.e_and_o - report.mg - report.amount_paid
      report.joined_amount_due = report.joined_total - report.joined_reserve + report.liquidated_reserve - report.e_and_o - report.mg - report.amount_paid
    end
    if film.deal_type_id == 4
      report.current_share_minus_expenses = report.current_total - report.current_total_expenses
      report.joined_total_expenses = report.current_total_expenses + report.cume_total_expenses
    end
  end

  def report_params
    params[:report].permit(:current_total_expenses, :cume_total_expenses, :mg, :e_and_o, :amount_paid)
  end

  def revenue_stream_params(id)
    params[:streams][id.to_s].permit(:current_revenue, :current_expense, :cume_revenue, :cume_expense, :licensor_percentage)
  end

  def export_report(report, streams, film)
    string = "<style>"
    string += "body {"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 16px;"
    string += "}"
    string += "table {"
    string +=   "width: 100%;"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 14px;"
    string +=   "text-align: left;"
    string += "}"
    string += ".upper-right {"
    string +=   "float: right;"
    string += "}"
    string += ".producer-report {"
    string +=   "padding-top: 5px;"
    string +=   "font-family: Times;"
    string +=   "letter-spacing: .5px;"
    string +=   "font-size: 30px;"
    string +=   "margin-bottom: 6px;"
    string += "}"
    string += ".film-movement {"
    string +=   "font-size: 16px;"
    string +=   "margin-bottom: 4px;"
    string += "}"
    string += "tr.totals-row td {"
    string +=   "padding-top: 14px;"
    string +=   "padding-bottom: 45px;"
    string += "}"
    string += "tr.totals-row-2 td {"
    string +=   "padding-top: 14px;"
    string += "}"
    string += "tr.current-share td {"
    string +=   "padding-bottom: 45px;"
    string += "}"
    string += "th {"
    string +=   "padding-bottom: 10px;"
    string += "}"
    string += ".clearfix:after {"
    string +=   "content: \"\";"
    string +=   "display: block;"
    string +=   "clear: both;"
    string +=  "}"
    string += ".bottom-table {"
    string +=   "float: right;"
    string +=   "width: 300px;"
    string += "}"
    string += ".bottom-text {"
    string +=   "font-size: 10px;"
    string += "}"
    string += "</style>"
    string += "<div class=\"upper-right\">"
    string +=   "<div class=\"producer-report\">Producer Report</div>"
    string +=   "#{report.film.licensor ? report.film.licensor.name : ""}<br>"
    string +=   "#{report.film.title}<br>"
    string +=   "Q#{report.quarter} #{report.year}"
    string += "</div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "109 West 27th Street<br>"
    string += "Suite 9B<br>"
    string += "New York, NY 10001<br>"
    string += "212.941.7744<br><br><br>"

    string += "<table><tr>"
    string +=   "<th>Current Period</th>"
    string +=   "<th>Revenue</th>"
    string +=   "<th>#{sprintf("%g", film.gr_percentage)}% Fee</th>" if gr_deal(report)
    string +=   "<th>Expenses</th>" if expense_class(report)
    string +=   "<th>Difference</th>" if expense_class(report)
    string +=   "<th>Licensor %</th>"
    string +=   "<th>Licensor Share</th></tr>"
    streams.each do |stream|
      if stream.current_revenue > 0 || stream.current_expense > 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.current_revenue)}</td>"
        string +=   "<td>#{negafy(stream.current_gr)}</td>" if gr_deal(report)
        string +=   "<td>#{negafy(stream.current_expense)}</td>" if expense_class(report)
        string +=   "<td>#{dollarify(stream.current_difference)}</td>" if expense_class(report)
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.current_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"#{report.film.deal_type_id == 4 ? "totals-row-2" : "totals-row"}\">"
    string +=   "<td>Current Total</td>"
    string +=   "<td>#{dollarify(report.current_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal(report)
    string +=   "<td>#{negafy(report.current_total_expenses)}</td>" if expense_class(report)
    string +=   "<td></td>" if expense_class(report)
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(report.current_total)}</td>"
    string += "</tr>"
    if report.film.deal_type_id == 4
      string += "<tr>"
      string +=   "<td>Current Expenses</td><td></td><td></td><td>#{negafy(report.current_total_expenses)}</td>"
      string += "</tr>"
      string += "<tr class=\"current-share\">"
      string +=   "<td>Current Licensor Share</td><td></td><td></td><td>#{dollarify(report.current_share_minus_expenses)}</td>"
      string += "</tr>"
    end
    string += "<tr>"
    string +=   "<th>Cumulative</th>"
    string +=   "<th></th>"
    string +=   "<th></th>" if gr_deal(report)
    string +=   "<th></th>" if expense_class(report)
    string +=   "<th></th>" if expense_class(report)
    string +=   "<th></th>"
    string +=   "<th></th>"
    string += "</tr>"
    streams.each do |stream|
      if stream.joined_revenue > 0 || stream.joined_expense > 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.joined_revenue)}</td>"
        string +=   "<td>#{negafy(stream.joined_gr)}</td>" if gr_deal(report)
        string +=   "<td>#{negafy(stream.joined_expense)}</td>" if expense_class(report)
        string +=   "<td>#{dollarify(stream.joined_difference)}</td>" if expense_class(report)
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.joined_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"totals-row\">"
    string +=   "<td>Cumulative Total</td>"
    string +=   "<td>#{dollarify(report.joined_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal(report)
    string +=   "<td>#{negafy(report.joined_total_expenses)}</td>" if expense_class(report)
    string +=   "<td></td>" if expense_class(report)
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(report.joined_total)}</td>"
    string += "</tr>"
    string += "</table>"
    string += "<div class=\"clearfix\"><div class=\"bottom-table\"><table>"
    string +=   "<tr>"
    string +=     "<td>Cumulative Licensor Share</td>"
    string +=     "<td>#{dollarify(report.joined_total)}</td>"
    string +=   "</tr>"
    if report.film.deal_type_id == 4
      string +=   "<tr>"
      string +=     "<td>Cumulative Expenses</td>"
      string +=     "<td>#{negafy(report.joined_total_expenses)}</td>"
      string +=   "</tr>"
    end
    string +=   "<tr>"
    string +=     "<td>MG</td>"
    string +=     "<td>#{negafy(report.mg)}</td>"
    string +=   "</tr>"
    string +=   "<tr>"
    string +=     "<td>Amount Paid</td>"
    string +=     "<td>#{negafy(report.amount_paid)}</td>"
    string +=   "</tr>"
    string +=   "<tr class=\"totals-row\">"
    string +=     "<td>Amount Due</td>"
    string +=     "<td>#{dollarify(report.joined_amount_due)}</td>"
    string +=   "</tr>"
    string += "</table></div></div>"
    string += "<div class=\"bottom-text\">"
    string += "If there is an amount due to Licensor on this report, please send an invoice for the amount due along with current bank wire information if located outside the U.S., and current mailing address if located inside the U.S.<br>No payments will be made without this invoice and information."
    string += "</div>"

    pdf = WickedPdf.new.pdf_from_string(string)
    subfolder = report.joined_amount_due > 0 ? 'amount due' : 'no amount due'
    save_path = Rails.root.join('statements', subfolder, report_name(film, report))
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
  end

end
