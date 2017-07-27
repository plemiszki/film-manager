class RoyaltyReport < ActiveRecord::Base

  include ActionView::Helpers::NumberHelper

  validates :film_id, :quarter, :year, presence: true
  validates :film_id, uniqueness: { scope: [:quarter, :year] }
  validates_numericality_of :current_total_expenses, :greater_than_or_equal_to => 0
  validates_numericality_of :cume_total_expenses, :greater_than_or_equal_to => 0
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :amount_paid, :greater_than_or_equal_to => 0

  belongs_to :film
  has_many :royalty_revenue_streams, dependent: :destroy

  def self.get_total_due(quarter, year)
    reports = RoyaltyReport.where(quarter: quarter, year: year)
    sum = 0
    reports.each do |report|
      report.calculate!
      sum += report.joined_amount_due unless report.joined_amount_due < 0
    end
    sum.to_f
  end

  def self.get_total_due_to_send(quarter, year)
    reports = RoyaltyReport.includes(:film).where(quarter: quarter, year: year, films: {export_reports: true, send_reports: true})
    sum = 0
    reports.each do |report|
      report.calculate!
      sum += report.joined_amount_due unless report.joined_amount_due < 0
    end
    sum.to_f
  end

  def export!(directory)
    film = self.film
    royalty_revenue_streams = self.royalty_revenue_streams

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
    string +=   "#{film.licensor ? film.licensor.name : ""}<br>"
    string +=   "#{film.title}<br>"
    string +=   "Q#{self.quarter} #{self.year}"
    string += "</div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "109 West 27th Street<br>"
    string += "Suite 9B<br>"
    string += "New York, NY 10001<br>"
    string += "212.941.7744<br><br><br>"

    string += "<table><tr>"
    string +=   "<th>Current Period</th>"
    string +=   "<th>Revenue</th>"
    string +=   "<th>#{sprintf("%g", film.gr_percentage)}% Fee</th>" if gr_deal
    string +=   "<th>Expenses</th>" if expense_class
    string +=   "<th>Difference</th>" if expense_class
    string +=   "<th>Licensor %</th>"
    string +=   "<th>Licensor Share</th></tr>"
    royalty_revenue_streams.each do |stream|
      if stream.current_revenue > 0 || stream.current_expense > 0
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
    string += "<tr class=\"#{film.deal_type_id == 4 ? "totals-row-2" : "totals-row"}\">"
    string +=   "<td>Current Total</td>"
    string +=   "<td>#{dollarify(self.current_total_revenue)}</td>"
    string +=   "<td></td>" if gr_deal
    string +=   "<td>#{negafy(self.current_total_expenses)}</td>" if expense_class
    string +=   "<td></td>" if expense_class
    string +=   "<td></td>"
    string +=   "<td>#{dollarify(self.current_total)}</td>"
    string += "</tr>"
    if film.deal_type_id == 4
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
    if film.deal_type_id == 4
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
    string += "If there is an amount due to Licensor on this self, please send an invoice for the amount due along with current bank wire information if located outside the U.S., and current mailing address if located inside the U.S.<br>No payments will be made without this invoice and information."
    string += "</div>"
    # if film.reserve
    #   string += "<div class=\"page-break\">here we go!!!</div>"
    # end

    pdf = WickedPdf.new.pdf_from_string(string)
    subfolder = self.joined_amount_due > 0 ? 'amount due' : 'no amount due'
    save_path = "#{directory}/#{report_name}"
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
  end

  def calculate!
    film = self.film
    self.current_total_revenue = 0.00
    self.current_total_expenses = 0.00 unless film.deal_type_id == 4
    self.current_total = 0.00
    royalty_revenue_streams = self.royalty_revenue_streams
    royalty_revenue_streams.each do |stream|
      if stream.revenue_stream_id == 3 && film.reserve
        self.current_reserve = stream.current_revenue * (film.reserve_percentage.fdiv(100))
      end
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
      self.joined_amount_due = self.joined_total - self.current_total_expenses - self.cume_total_expenses - self.joined_reserve - self.e_and_o - self.mg - self.amount_paid
    else
      self.amount_due = self.cume_total - self.cume_reserve - self.e_and_o - self.mg - self.amount_paid
      self.joined_amount_due = self.joined_total - self.joined_reserve - self.e_and_o - self.mg - self.amount_paid
    end
    return royalty_revenue_streams
  end

  private

  def expense_class
    self.film.deal_type_id != 1 && self.film.deal_type_id != 4
  end

  def gr_deal
    self.film.deal_type_id == 5 || self.film.deal_type_id == 6
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

  def report_name
    "#{self.film.title} - Q#{self.quarter} #{self.year}.pdf"
  end

end
