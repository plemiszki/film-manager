class Api::RoyaltyReportsController < ApplicationController

  include ActionView::Helpers::NumberHelper

  def index
    @reports = RoyaltyReport.where(quarter: params[:quarter], year: params[:year])
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

  def export
    query_data_for_show_jbuilder
    export_report(@reports[0], @streams, @film)

    save_path = Rails.root.join('statements', report_name(@film, @reports[0]))
    File.open(save_path, 'r') do |f|
      send_data f.read, filename: report_name(@film, @reports[0])
    end
    File.delete(save_path)
  end

  def export_all
    Pathname.new(Rails.root.join('statements')).children.each { |p| p.unlink }
    if params[:days_due] == 'all'
      films = Film.where(short_film: false, export_reports: true).order(:title)
    else
      films = Film.where(days_statement_due: params[:days_due], export_reports: true).order(:title)
    end
    reports = []
    films.each do |film|
      reports << RoyaltyReport.where(quarter: params[:quarter], year: params[:year], film_id: film.id)[0]
    end
    reports.each do |report|
      @report = report
      @film = Film.find(@report.film_id)
      @streams = RoyaltyRevenueStream.where(royalty_report_id: @report.id).joins(:revenue_stream).order('revenue_streams.order')
      calculate(@film, @report, @streams)
      export_report(@report, @streams, @film)
    end

    files = Dir.glob("#{Rails.root}/statements/*.pdf")
    require 'zip'
    Zip::File.open(Rails.root.join('statements', 'statements.zip'), Zip::File::CREATE) do |zip|
      files.each do |file|
        zip.add(file.split('/')[-1], file)
      end
    end
    render text: 'done', status: 200
  end

  def zip
    zip_data = File.read(Rails.root.join('statements', 'statements.zip'))
    send_data(zip_data, :type => 'application/zip', :filename => 'statements.zip')
  end

  def upload
    uploaded_io = params[:user][:file]
    File.open(Rails.root.join('sage', uploaded_io.original_filename), 'wb') do |file|
      file.write(uploaded_io.read)
    end
    require 'roo'
    xlsx = Roo::Spreadsheet.open(Rails.root.join('sage', uploaded_io.original_filename).to_s)
    sheet = xlsx.sheet(0)
    index = 2
    errors = []
    while index <= xlsx.last_row
      columns = sheet.row(index)
      found_film = false
      films = Film.where("short_film = FALSE AND LOWER(films.sage_id) LIKE LOWER('%#{columns[0].gsub("'", "''")}%')")
      if films.length > 0
        found_film = true
      else
        films = Film.where("short_film = FALSE AND LOWER(films.title) LIKE LOWER('%#{columns[0].gsub("'", "''")}%')")
        if films.length > 0
          found_film = true
        else
          errors << "Sage ID #{columns[0]} not found."
        end
      end

      if found_film
        film = films[0]
        report = RoyaltyReport.find_by(film_id: film.id, quarter: params[:quarter], year: params[:year])
        unless report
          report = RoyaltyReport.create!(film_id: film.id, deal_id: film.deal_type_id, quarter: params[:quarter], year: params[:year], mg: film.mg)
          #determine amount paid
          FilmRevenuePercentage.where(film_id: film.id).each do |film_revenue_percentage|
            RoyaltyRevenueStream.create(royalty_report_id: report.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value)
          end
        end

        # update royalty revenue streams
      end

      index += 1
    end
    flash[:errors] = errors
    redirect_to '/royalty_reports'
  end

  private

  def report_name(film, report)
    "#{film.title} - Q#{report.quarter} #{report.year}.pdf"
  end

  def query_data_for_show_jbuilder
    @reports = RoyaltyReport.where(id: params[:id])
    @film = Film.find(@reports[0].film_id)
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id).joins(:revenue_stream).order('revenue_streams.order')
    p @streams.pluck(:revenue_stream_id)
    calculate(@film, @reports[0], @streams)
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
      '$' + string
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
      if film.deal_type_id == 4
        report.amount_due = report.cume_total - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
        report.joined_amount_due = report.joined_total - report.current_total_expenses - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
      else
        report.joined_amount_due = report.joined_total - report.e_and_o - report.mg - report.amount_paid
        report.amount_due = report.cume_total - report.e_and_o - report.mg - report.amount_paid
      end
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
    string +=   "<th>#{sprintf("%g", report.gr_percentage)}% Fee</th>" if gr_deal(report)
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
    save_path = Rails.root.join('statements', report_name(film, report))
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
  end

end
