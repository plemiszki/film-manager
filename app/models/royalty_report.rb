class RoyaltyReport < ActiveRecord::Base

  include ActionView::Helpers::NumberHelper

  validates :film_id, :quarter, :year, :deal_id, presence: true
  validates :film_id, uniqueness: { scope: [:quarter, :year] }
  validates_numericality_of :current_total_expenses
  validates_numericality_of :cume_total_expenses
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :amount_paid, :greater_than_or_equal_to => 0

  belongs_to :film
  has_many :royalty_revenue_streams, -> { joins(:revenue_stream).order('revenue_streams.order') }, dependent: :destroy

  def self.create_missing_film_statement(year:, quarter:, film_id:)
    film = Film.find(film_id)
    report = RoyaltyReport.create!(film_id: film_id, deal_id: film.deal_type_id, quarter: quarter, year: year, mg: film.mg, e_and_o: film.e_and_o)
    report.create_empty_streams!
    report.transfer_and_calculate_from_previous_report!
  end

  def self.calculate_all!
    RoyaltyReport.all.order(:year, :quarter, :id).each do |report|
      report.calculate!
    end
  end

  def self.get_total_due(quarter, year, days_statement_due = nil)
    if days_statement_due
      reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { days_statement_due: days_statement_due })
    else
      reports = RoyaltyReport.where(quarter: quarter, year: year)
    end
    sum = 0
    reports.each do |report|
      sum += report.joined_amount_due unless report.joined_amount_due < 0
    end
    sum.to_f
  end

  def self.get_total_due_to_send(quarter, year, days_statement_due = nil)
    if days_statement_due
      reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { days_statement_due: days_statement_due, export_reports: true, send_reports: true })
    else
      reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { export_reports: true, send_reports: true })
    end
    sum = 0
    reports.each do |report|
      sum += report.joined_amount_due unless report.joined_amount_due < 0
    end
    sum.to_f
  end

  def self.get_reserves(quarter, year)
    reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { reserve: true, export_reports: true, send_reports: true })
    sum = 0
    result = {}
    reports.each do |report|
      sum += report.current_reserve
    end
    sum.to_f
  end

  def self.get_films_with_amount_due_not_being_sent(quarter, year)
    reports1 = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { export_reports: false }).to_a
    reports2 = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { send_reports: false }).to_a
    reports = reports1 | reports2
    titles = {}
    reports.each do |report|
      if report.joined_amount_due > 0
        titles[report.film.title] = report.joined_amount_due.to_f
      end
    end
    titles
  end

  def self.get_reserve_numbers(quarter, year)
    reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: { reserve: true })
    result = Hash.new { |h,k| h[k] = 0 }
    reports.each do |report|
      film = report.film
      result[:total] += report.current_reserve
      result[film.reserve_quarters] += report.current_reserve
    end
    result.map { |key, value| [key, value.to_f] }.to_h
  end

  def create_empty_streams!
    FilmRevenuePercentage.where(film_id: self.film_id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
      RoyaltyRevenueStream.create!(royalty_report_id: self.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value)
    end
  end

  def get_total_past_reserves(multiple_films = nil)
    if self.id.zero?
      result = Hash.new(0)
      multiple_films.each do |film|
        report = film.royalty_reports.order(:id).last
        next unless report
        report.past_reports.each do |report|
          result["Q#{report.quarter} #{report.year}"] += report.current_reserve
        end
      end
    else
      result = {}
      self.past_reports.each do |report|
        result["Q#{report.quarter} #{report.year}"] = report.current_reserve
      end
    end
    result
  end

  def get_reserves_breakdown
    result = {}
    film = self.film
    total_past_reserves = self.get_total_past_reserves
    quarters_with_reserves = total_past_reserves.length
    total_reserves = 0
    total_past_reserves.each_with_index do |(quarter_string, amount), index|
      year = quarter_string.split(' ')[-1].to_i
      quarter = quarter_string.split(' ')[0][-1].to_i
      result[quarter_string] = {}
      result[quarter_string]['new_reserves_this_quarter'] = amount
      due_for_liquidation = RoyaltyReport.quarter_math(year: year, quarter: quarter, diff: film.reserve_quarters * -1)
      if result["Q#{due_for_liquidation[:quarter]} #{due_for_liquidation[:year]}"]
        liquidated_this_quarter = result["Q#{due_for_liquidation[:quarter]} #{due_for_liquidation[:year]}"]['new_reserves_this_quarter']
      else
        liquidated_this_quarter = 0
      end
      result[quarter_string]['liquidated_this_quarter'] = liquidated_this_quarter
      total_reserves += amount
      total_reserves -= liquidated_this_quarter
      result[quarter_string]['total_reserves'] = total_reserves
    end
    this_quarter_string = "Q#{self.quarter} #{self.year}"
    result[this_quarter_string] = {}
    result[this_quarter_string]['new_reserves_this_quarter'] = self.current_reserve
    due_for_liquidation = RoyaltyReport.quarter_math(year: year, quarter: quarter, diff: film.reserve_quarters * -1)
    if result["Q#{due_for_liquidation[:quarter]} #{due_for_liquidation[:year]}"]
      liquidated_this_quarter = result["Q#{due_for_liquidation[:quarter]} #{due_for_liquidation[:year]}"]['new_reserves_this_quarter']
    else
      liquidated_this_quarter = 0
    end
    result[this_quarter_string]['liquidated_this_quarter'] = liquidated_this_quarter
    result[this_quarter_string]['total_reserves'] = total_reserves + self.current_reserve - liquidated_this_quarter
    return result
  end

  def transfer_and_calculate_from_previous_report!
    prev_report = self.prev_report
    if prev_report
      prev_report_streams = prev_report.royalty_revenue_streams
      royalty_revenue_streams.each_with_index do |stream, index|
        new_revenue = prev_report_streams[index].current_revenue + prev_report_streams[index].cume_revenue
        new_expense = prev_report_streams[index].current_expense + prev_report_streams[index].cume_expense
        stream.update!(cume_revenue: new_revenue, cume_expense: new_expense)
      end
      amount_due = prev_report.joined_amount_due < 0 ? 0 : prev_report.joined_amount_due
      update!({
        amount_paid: prev_report.amount_paid + amount_due,
        cume_total_expenses: prev_report.joined_total_expenses
      })
    end
    self.calculate!
  end

  def calculate!
    revenue_stream_ids = Hash[*RevenueStream.all.map { |stream| [stream.name, stream.id] }.flatten]
    film = self.film
    self.current_total_revenue = 0.00
    self.current_total_expenses = 0.00 unless film.deal_type_id == 4
    self.current_total = 0.00
    self.cume_total_revenue = 0.00
    self.cume_total_expenses = 0.00 unless film.deal_type_id == 4
    self.cume_total = 0.00
    self.joined_total_revenue = 0.00
    self.joined_total_expenses = 0.00 unless film.deal_type_id == 4
    self.joined_total = 0.00

    royalty_revenue_streams = RoyaltyRevenueStream.where(royalty_report_id: self.id).joins(:revenue_stream).order('revenue_streams.order')
    royalty_revenue_streams.each do |stream|
      if stream.revenue_stream_id == revenue_stream_ids['Video'] && film.reserve
        unless self.year == 2017 && self.quarter == 1 # returns against reserves didn't start until Q2 2017
          if stream.current_revenue > 0
            self.current_reserve = stream.current_revenue * (film.reserve_percentage.fdiv(100))
          else
            self.current_reserve = 0
          end
          total_past_reserves = self.get_total_past_reserves
          self.cume_reserve = total_past_reserves.values.sum
          self.current_liquidated_reserve = total_past_reserves.values[film.reserve_quarters * -1] || 0
          self.cume_liquidated_reserve = total_past_reserves.values[0...(film.reserve_quarters * -1)].sum
          self.joined_liquidated_reserve = self.current_liquidated_reserve + self.cume_liquidated_reserve
        end
      end
      # joined revenue and joined expenses will get updated when stream.update is called:
      stream.joined_revenue = stream.current_revenue + stream.cume_revenue
      stream.joined_expense = stream.current_expense + stream.cume_expense
      if film.deal_type_id == 1 # No Expenses Recouped
        stream.update({
          current_licensor_share: (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2),
          cume_licensor_share: (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2),
          joined_licensor_share: (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        })
      elsif film.deal_type_id == 2 # Expenses Recouped From Top
        current_difference = stream.current_revenue - stream.current_expense
        cume_difference = stream.cume_revenue - stream.cume_expense
        joined_difference = stream.joined_revenue - stream.joined_expense
        stream.update({
          current_difference: current_difference,
          current_licensor_share: (current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          cume_difference: cume_difference,
          cume_licensor_share: (cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          joined_difference: joined_difference,
          joined_licensor_share: (joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        })
      elsif film.deal_type_id == 3 # Theatrical Expenses Recouped From Top
        if ["Theatrical", "Non-Theatrical", "Commercial Video"].include?(stream.revenue_stream.name)
          current_difference = stream.current_revenue - stream.current_expense
          cume_difference = stream.cume_revenue - stream.cume_expense
          joined_difference = stream.joined_revenue - stream.joined_expense
        else
          current_difference = stream.current_revenue
          cume_difference = stream.cume_revenue
          joined_difference = stream.joined_revenue
        end
        stream.update({
          current_difference: current_difference,
          current_licensor_share: (current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          cume_difference: cume_difference,
          cume_licensor_share: (cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          joined_difference: joined_difference,
          joined_licensor_share: (joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        })
      elsif film.deal_type_id == 4 # Expenses Recouped From Licensor Share
        stream.update({
          current_licensor_share: (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2),
          cume_licensor_share: (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2),
          joined_licensor_share: (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        })
      elsif film.deal_type_id == 5 # GR Percentage
        current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        current_difference = stream.current_revenue - current_gr - stream.current_expense
        cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        cume_difference = stream.cume_revenue - cume_gr - stream.cume_expense
        joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        joined_difference = stream.joined_revenue - joined_gr - stream.joined_expense
        stream.update({
          current_gr: current_gr,
          current_difference: current_difference,
          current_licensor_share: (current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          cume_gr: cume_gr,
          cume_difference: cume_difference,
          cume_licensor_share: (cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
          joined_gr: joined_gr,
          joined_difference: joined_difference,
          joined_licensor_share: (joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        })
      elsif film.deal_type_id == 6 # GR Percentage Theatrical/Non-Theatrical
        if ["Theatrical", "Non-Theatrical"].include?(stream.revenue_stream.name)
          current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          current_difference = stream.current_revenue - current_gr - stream.current_expense
          cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          cume_difference = stream.cume_revenue - cume_gr - stream.cume_expense
          joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          joined_difference = stream.joined_revenue - joined_gr - stream.joined_expense
          stream.update({
            current_gr: current_gr,
            current_difference: current_difference,
            current_licensor_share: (current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
            cume_gr: cume_gr,
            cume_difference: cume_difference,
            cume_licensor_share: (cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
            joined_gr: joined_gr,
            joined_difference: joined_difference,
            joined_licensor_share: (joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          })
        else
          current_difference = stream.current_revenue - stream.current_expense
          cume_difference = stream.cume_revenue - stream.cume_expense
          joined_difference = stream.joined_revenue - stream.joined_expense
          stream.update({
            current_difference: current_difference,
            current_licensor_share: (current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
            cume_difference: cume_difference,
            cume_licensor_share: (cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2),
            joined_difference: joined_difference,
            joined_licensor_share: (joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          })
        end
      end

      self.current_total_revenue += stream.current_revenue
      self.current_total_expenses += stream.current_expense unless film.deal_type_id == 4
      self.current_total += stream.current_licensor_share

      self.cume_total_revenue += stream.cume_revenue
      self.cume_total_expenses += stream.cume_expense unless film.deal_type_id == 4
      self.cume_total += stream.cume_licensor_share

      self.joined_total_revenue += stream.joined_revenue
      self.joined_total_expenses += stream.joined_expense unless film.deal_type_id == 4
      self.joined_total += stream.joined_licensor_share
    end
    self.joined_reserve = self.current_reserve + self.cume_reserve
    if film.deal_type_id == 4
      self.current_share_minus_expenses = self.current_total - self.current_total_expenses
      self.joined_total_expenses = self.current_total_expenses + self.cume_total_expenses
      self.amount_due = self.cume_total - self.cume_total_expenses - self.cume_reserve - self.e_and_o - self.mg - self.amount_paid
      self.joined_amount_due = self.joined_total - self.current_total_expenses - self.cume_total_expenses - self.joined_reserve + self.joined_liquidated_reserve - self.e_and_o - self.mg - self.amount_paid
    else
      self.amount_due         = self.cume_total   - self.cume_reserve   + self.cume_liquidated_reserve    - self.e_and_o - self.mg - self.amount_paid
      self.joined_amount_due  = self.joined_total - self.joined_reserve + self.joined_liquidated_reserve  - self.e_and_o - self.mg - self.amount_paid
    end
    self.save!
  end

  def self.calculate_crossed_films_report(film, year, quarter)
    crossed_film_ids = film.crossed_films.pluck(:crossed_film_id)
    films = Film.where(id: [film.id] + crossed_film_ids)
    result = RoyaltyReport.new({ id: 0, year: year, quarter: quarter, deal_id: films.first.deal_type_id, gr_percentage: films.first.gr_percentage })
    streams = []
    RevenueStream.all.each_with_index do |revenue_stream, index|
      streams << RoyaltyRevenueStream.new({
        id: index,
        revenue_stream_id: revenue_stream.id
      })
    end
    films.each_with_index do |film, index|
      report = RoyaltyReport.find_by(year: year, quarter: quarter, film_id: film.id)
      next unless report
      report_streams = report.royalty_revenue_streams
      result.update({
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
        joined_liquidated_reserve: result.joined_liquidated_reserve + report.joined_liquidated_reserve
      })
      report_streams.each_with_index do |report_stream, index|
        stream = streams[index]
        stream.update({
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
    [result, streams, films]
  end

  def export(directory:, royalty_revenue_streams:, multiple_films: nil)
    @film = self.film || multiple_films.first
    if multiple_films
      titles = multiple_films.map(&:title).sort
    else
      titles = [@film.title]
    end
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
    string += ".page-break {"
    string +=   "page-break-before: always;"
    string += "}"
    string += "</style>"
    string += "<div class=\"upper-right\">"
    string +=   "<div class=\"producer-report\">Producer Report</div>"
    string +=   "#{@film.licensor ? @film.licensor.name : ""}<br>"
    titles.each do |title|
      string +=   "#{title}<br>"
    end
    string +=   "Q#{self.quarter} #{self.year}"
    string += "</div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "505 8th Avenue<br>"
    string += "Suite 1102<br>"
    string += "New York, NY 10018<br>"
    string += "212.941.7744<br><br><br>"

    string += "<table><tr>"
    string +=   "<th>Current Period</th>"
    string +=   "<th>Revenue</th>"
    string +=   "<th>#{sprintf("%g", @film.gr_percentage)}% Fee</th>" if gr_deal
    string +=   "<th>Expenses</th>" if expense_class
    string +=   "<th>Difference</th>" if expense_class
    string +=   "<th>Licensor %</th>"
    string +=   "<th>Licensor Share</th></tr>"
    royalty_revenue_streams.each do |stream|
      if stream.current_revenue != 0 || stream.current_expense != 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.current_revenue)}</td>"
        string +=   "<td>#{negafy(stream.current_gr)}</td>" if gr_deal
        string +=   "<td>#{negafy(stream.current_expense)}</td>" if expense_class
        string +=   "<td>#{dollarify(stream.current_difference)}</td>" if expense_class
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.current_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"#{@film.deal_type_id == 4 ? "totals-row-2" : "totals-row"}\">"
    string +=   "<td>Current Total</td>"
    string +=   "<td>#{dollarify(self.current_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal
    string +=   "<td>#{negafy(self.current_total_expenses)}</td>" if expense_class
    string +=   "<td></td>" if expense_class
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(self.current_total)}</td>"
    string += "</tr>"
    if @film.deal_type_id == 4
      string += "<tr>"
      string +=   "<td>Current Expenses</td><td></td><td></td><td>#{negafy(self.current_total_expenses)}</td>"
      string += "</tr>"
      string += "<tr class=\"current-share\">"
      string +=   "<td>Current Licensor Share</td><td></td><td></td><td>#{dollarify(self.current_share_minus_expenses)}</td>"
      string += "</tr>"
    end
    string += "<tr>"
    string +=   "<th>Cumulative</th>"
    string +=   "<th></th>"
    string +=   "<th></th>" if gr_deal
    string +=   "<th></th>" if expense_class
    string +=   "<th></th>" if expense_class
    string +=   "<th></th>"
    string +=   "<th></th>"
    string += "</tr>"
    royalty_revenue_streams.each do |stream|
      if stream.joined_revenue > 0 || stream.joined_expense > 0
        string += "<tr>"
        string +=   "<td>#{stream.revenue_stream.name}</td>"
        string +=   "<td>#{dollarify(stream.joined_revenue)}</td>"
        string +=   "<td>#{negafy(stream.joined_gr)}</td>" if gr_deal
        string +=   "<td>#{negafy(stream.joined_expense)}</td>" if expense_class
        string +=   "<td>#{dollarify(stream.joined_difference)}</td>" if expense_class
        string +=   "<td>#{sprintf("%g", stream.licensor_percentage)}%</td>"
        string +=   "<td>#{dollarify(stream.joined_licensor_share)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"totals-row\">"
    string +=   "<td>Cumulative Total</td>"
    string +=   "<td>#{dollarify(self.joined_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal
    string +=   "<td>#{negafy(self.joined_total_expenses)}</td>" if expense_class
    string +=   "<td></td>" if expense_class
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(self.joined_total)}</td>"
    string += "</tr>"
    string += "</table>"
    string += "<div class=\"clearfix\"><div class=\"bottom-table\"><table>"
    string +=   "<tr>"
    string +=     "<td>Cumulative Licensor Share</td>"
    string +=     "<td>#{dollarify(self.joined_total)}</td>"
    string +=   "</tr>"
    if @film.deal_type_id == 4
      string +=   "<tr>"
      string +=     "<td>Cumulative Expenses</td>"
      string +=     "<td>#{negafy(self.joined_total_expenses)}</td>"
      string +=   "</tr>"
    end
    string +=   "<tr>"
    string +=     "<td>MG</td>"
    string +=     "<td>#{negafy(self.mg)}</td>"
    string +=   "</tr>"
    if self.e_and_o > 0
      string +=   "<tr>"
      string +=     "<td>E & O</td>"
      string +=     "<td>#{negafy(self.e_and_o)}</td>"
      string +=   "</tr>"
    end
    if self.joined_reserve > 0
      string +=   "<tr>"
      string +=     "<td>Reserve Against Returns</td>"
      string +=     "<td>#{negafy(self.joined_reserve)}</td>"
      string +=   "</tr>"
    end
    if self.joined_liquidated_reserve > 0
      string +=   "<tr>"
      string +=     "<td>Liquidated Reserve</td>"
      string +=     "<td>#{dollarify(self.joined_liquidated_reserve)}</td>"
      string +=   "</tr>"
    end
    string +=   "<tr>"
    string +=     "<td>Amount Paid</td>"
    string +=     "<td>#{negafy(self.amount_paid)}</td>"
    string +=   "</tr>"
    string +=   "<tr class=\"totals-row\">"
    string +=     "<td>Amount Due</td>"
    string +=     "<td>#{dollarify(self.joined_amount_due)}</td>"
    string +=   "</tr>"
    string += "</table></div></div>"
    string += "<div class=\"bottom-text\">"
    string += "If there is an amount due to Licensor on this statement, please send an invoice for the amount due along with current bank wire information if located outside the U.S., and current mailing address if located inside the U.S.<br>No payments will be made without this invoice and information."
    string += "</div>"
    if @film.reserve
      string += "<div class=\"page-break\"></div>"
      string += "<h1 style='text-align: center; margin-bottom: #{titles.length > 1 ? '20' : '10'}px;'>Reserves Against Returns</h1>"
      string += "<h3 style='text-align: center; margin-bottom: 20px;'>#{@film.title}</h3>" unless titles.length > 1
      string += "<table style='padding: 5px; border: 1px solid black;'>"
      string += "<tr><th>Quarter Withheld</th><th>Reserve Amount</th><th>Amount Liquidated</th><th>Total Remaining</th><th>Quarter Liquidated</th></tr>"
      total_reserves = 0
      total_liquidated = 0
      total_remaining = 0
      total_past_reserves = self.get_total_past_reserves(multiple_films)
      quarters_with_reserves = total_past_reserves.length
      total_past_reserves.each_with_index do |(quarter, amount), index|
        if amount > 0
          total_reserves += amount
          liquidated = (index < (quarters_with_reserves - @film.reserve_quarters + 1) ? amount : 0)
          total_liquidated += liquidated
          difference = amount - liquidated
          total_remaining += difference
          new_quarter = quarter.split[0].split('')[1].to_i + @film.reserve_quarters
          new_year = quarter.split[1].to_i
          until new_quarter < 5
            new_year += 1
            new_quarter -= 4
          end
          string += "<tr><td>#{quarter}</td><td>#{dollarify(amount)}</td><td>#{dollarify(liquidated)}</td><td>#{dollarify(difference)}</td><td>Q#{new_quarter} #{new_year}</td></tr>"
        end
      end
      new_quarter = self.quarter + @film.reserve_quarters
      new_year = self.year
      until new_quarter < 5
        new_year += 1
        new_quarter -= 4
      end
      string += "<tr><td>Q#{self.quarter} #{self.year}</td><td>#{dollarify(self.current_reserve)}</td><td>#{dollarify(0)}</td><td>#{dollarify(self.current_reserve)}</td><td>Q#{new_quarter} #{new_year}</td></tr>"
      string += "<tr><td></td><td></td><td></td><td></td><td></td></tr>"
      total_reserves += self.current_reserve
      total_remaining += self.current_reserve
      string += "<tr style='font-weight: bold;'><td></td><td>#{dollarify(total_reserves)}</td><td>#{dollarify(total_liquidated)}</td><td>#{dollarify(total_remaining)}</td><td></td></tr>"
      string += "</table>"
    end

    pdf = WickedPdf.new.pdf_from_string(string)
    subfolder = self.joined_amount_due > 0 ? 'amount due' : 'no amount due'
    licensor_name = @film.licensor.name if titles.length > 1
    report_name = report_name(titles, licensor_name)
    save_path = "#{directory}/#{report_name}"
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
    report_name
  end

  def next_report
    quarter = self.quarter + 1
    year = self.year
    if quarter == 5
      quarter = 1
      year += 1
    end
    RoyaltyReport.find_by({ year: year, quarter: quarter, film_id: self.film_id })
  end

  def prev_report
    quarter = self.quarter - 1
    year = self.year
    if quarter == 0
      quarter = 4
      year -= 1
    end
    RoyaltyReport.find_by({ year: year, quarter: quarter, film_id: self.film_id })
  end

  def self.quarter_math(quarter:, year:, diff:)
    diff_years, diff_quarters = diff.divmod(4)
    result_year = year + diff_years
    result_quarter = quarter + diff_quarters
    if result_quarter > 4
      years, quarters = result_quarter.divmod(4)
      result_year += years
      result_quarter = quarters
    elsif result_quarter < 1
      years, quarters = result_quarter.divmod(4)
      result_year += years
      result_quarter += 4
    end
    {
      year: result_year,
      quarter: result_quarter
    }
  end

  def past_reports
    RoyaltyReport.where("film_id = ? AND id < ?", film_id, id).order(:id)
  end

  private

  def expense_class
    @film.deal_type_id != 1 && @film.deal_type_id != 4
  end

  def gr_deal
    @film.deal_type_id == 5 || @film.deal_type_id == 6
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
    if input > 0
      '($' + string + ')'
    elsif input == 0
      "$#{string}"
    else
      '$' + string[1..-1]
    end
  end

  def report_name(titles, licensor_name = nil)
    if titles.length > 1
      filename = "#{licensor_name} package #{Time.now.to_i} - Q#{self.quarter} #{self.year}"
    else
      first_title = titles.first
      first_title = first_title[0..-2] if first_title.chars.last == "?"
      filename = "#{first_title} - Q#{self.quarter} #{self.year}"
    end
    filename = filename[0..249] if filename.length > 250
    "#{filename}.pdf"
  end

end
