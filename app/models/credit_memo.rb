class CreditMemo < ActiveRecord::Base

  DVDS_ON_FIRST_PAGE = 37
  DVDS_PER_PAGE = 46

  include Dollarify

  validates :sent_date, :number, :return_number, :customer_id, presence: true
  validates :number, uniqueness: true

  has_many :credit_memo_rows, -> { order('credit_memo_rows.id') }, dependent: :destroy

  belongs_to :customer, class_name: 'DvdCustomer'
  belongs_to :return

  def export(path)
    string = "<style>"
    string += "@import url('https://fonts.googleapis.com/css2?family=Tinos:wght@700&display=swap');"
    string += "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap');"
    string += "@import url('https://fonts.googleapis.com/css2?family=Lato:wght@700&display=swap');"
    string += "body {"
    string +=   "font-family: Roboto;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 16px;"
    string += "}"
    string += "table {"
    string +=   "margin-top: 40px;"
    string +=   "width: 100%;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 14px;"
    string +=   "text-align: left;"
    string +=   "margin-bottom: 40px;"
    string += "}"
    string += ".upper-right {"
    string +=   "float: right;"
    string +=   "width: 300px;"
    string +=   "line-height: 1.5;"
    string += "}"
    string += ".upper-right-bold {"
    string +=   "margin-top: 10px;"
    string +=   "font-family: Lato;"
    string +=   "font-size: 18px;"
    string += "}"
    string += ".invoice-header {"
    string +=   "font-family: Tinos;"
    string +=   "line-height: normal;"
    string +=   "letter-spacing: .5px;"
    string +=   "font-size: 40px;"
    string +=   "margin-bottom: 10px;"
    string += "}"
    string += ".film-movement {"
    string +=   "font-size: 16px;"
    string +=   "margin-bottom: 4px;"
    string += "}"
    string += "th, tr.total-row td {"
    string +=   "font-family: Lato;"
    string += "}"
    string += "th, td {"
    string +=   "width: 20%;"
    string += "}"
    string += "th:first-of-type, td:first-of-type {"
    string +=   "width: 50%;"
    string += "}"
    string += "th:nth-of-type(3), td:nth-of-type(3) {"
    string +=   "width: 10%;"
    string += "}"
    string += "th, td {"
    string +=   "padding-bottom: 10px;"
    string += "}"
    string += "td.big-margin {"
    string +=   "padding-bottom: 20px;"
    string += "}"
    string += ".page-break {"
    string +=   "page-break-before: always;"
    string += "}"
    string += ".address-block {"
    string +=   "display: inline-block;"
    string += "}"
    string += ".address-block p, .notes p {"
    string +=   "font-family: Lato;"
    string +=   "margin-bottom: 5px;"
    string += "}"
    string += ".address-block.first {"
    string +=   "margin-right: 50px;"
    string += "}"
    string += "</style>"

    string += "<div class=\"upper-right\">"
    string +=   "<div class=\"invoice-header\">Credit Memo</div>"
    string +=   "Date Sent: #{self.sent_date.strftime("%-m/%-d/%y")}<br>"
    string +=   "Credit Memo Number: #{self.number}<br>"
    string +=   "Return Number: #{self.return_number}<br>"
    string += "</div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "237 West 35th Street<br>"
    string += "Suite 604<br>"
    string += "New York, NY 10001<br>"
    string += "212.941.7744<br>"
    string += "<br>"

    string += '<div class="address-block first">'
    string += "<p>Bill To:</p>"
    string += "#{self.billing_name}<br />"
    string += "#{self.billing_address1}<br />"
    unless self.billing_address2.empty?
      string += "#{self.billing_address2}<br />"
    end
    string += "#{self.billing_city}, #{self.billing_state} #{self.billing_zip}<br />"
    unless self.billing_country == 'USA'
      string += "#{self.billing_country}"
    end
    string += '</div>'

    string += "<table>"
    string += "<tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>"
    total_dvds = 0
    credit_memo_rows.each_with_index do |row, index|
      total_dvds += row.item_qty
      if index == DVDS_ON_FIRST_PAGE || ((index - DVDS_ON_FIRST_PAGE) % DVDS_PER_PAGE == 0)
        string += '</table><div class="page-break"><table><tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>'
      end
      string += "<tr>"
      string += "<td>#{row.item_label}</td>"
      string += "<td>#{dollarify(row.unit_price.to_s)}</td><td>#{row.item_qty}</td>"
      string += "<td>#{dollarify(row.total_price.to_s)}</td>"
      string += "</tr>"
    end
    string += "<tr class=\"total-row\"><td>Total</td><td></td><td>#{total_dvds}</td><td>#{dollarify(self.total.to_s)}</td></tr>"
    string += "</table>"
    string += "</div>"
    File.open(path, 'wb') do |f|
      f << WickedPdf.new.pdf_from_string(string)
    end
  end

end
