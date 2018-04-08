class Invoice < ActiveRecord::Base

  include ActionView::Helpers::NumberHelper

  validates :invoice_type, :number, presence: true

  has_many :invoice_rows, -> { order('invoice_rows.id') }, dependent: :destroy
  belongs_to :customer, class_name: 'DvdCustomer'
  belongs_to :booking

  def self.create_invoice(args)
    if args[:from].class.to_s == "PurchaseOrder"
      purchase_order = args[:from]
      dvd_customer = DvdCustomer.find(purchase_order.customer_id)
      args.delete(:from)
      invoice = Invoice.create(args)
      rows = purchase_order.purchase_order_items
    end
    total = 0
    rows = rows.map do |row|
      if row.class.to_s == "PurchaseOrderItem"
        item = row.item
        if item.class.to_s == "Dvd"
          price = Invoice.get_item_price(item.id, 'dvd', dvd_customer).to_f
          total += (price * row.qty)
          film = item.feature
          InvoiceRow.create({
            invoice_id: invoice.id,
            item_label: (film.title + (["Retail", "Club"].include?(item.dvd_type.name) ? "" : " (#{item.dvd_type.name})")),
            item_qty: row.qty,
            unit_price: price,
            total_price: price * row.qty,
            item_id: film.id,
            item_type: 'dvd'
          })
        else
          price = Invoice.get_item_price(item.id, 'giftbox', dvd_customer).to_f
          total += (price * row.qty)
          InvoiceRow.create({
            invoice_id: invoice.id,
            item_label: item.name,
            item_qty: row.qty,
            unit_price: price,
            total_price: price * row.qty,
            item_id: item.id,
            item_type: 'giftbox'
          })
        end
      end
    end
    invoice.update(total: total)
    invoice
  end

  def self.get_item_price(id, type, dvd_customer, item = nil)
    return dvd_customer.per_unit if dvd_customer.per_unit
    if type == "dvd"
      item ||= Dvd.find(id)
      price = item.price
    elsif type == "giftbox"
      item ||= Giftbox.find(id)
      price = item.msrp
    end
    (price * ((100 - dvd_customer.discount) / 100)).floor(2)
  end

  def export!(path)
    string = "<style>"
    string += "body {"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 16px;"
    string += "}"
    string += "table {"
    string +=   "margin-top: 40px;"
    string +=   "width: 100%;"
    string +=   "font-family: Arial;"
    string +=   "font-size: 12px;"
    string +=   "line-height: 14px;"
    string +=   "text-align: left;"
    string +=   "margin-bottom: 40px;"
    string += "}"
    string += ".upper-right {"
    string +=   "float: right;"
    string +=   "width: 200px;"
    string +=   "line-height: 1.5;"
    string += "}"
    string += ".upper-right-bold {"
    string +=   "margin-top: 10px;"
    string +=   "font-weight: bold;"
    string += "}"
    string += ".invoice-header {"
    string +=   "font-family: Times;"
    string +=   "line-height: normal;"
    string +=   "letter-spacing: .5px;"
    string +=   "font-size: 40px;"
    string +=   "margin-bottom: 10px;"
    string += "}"
    string += ".film-movement {"
    string +=   "font-size: 16px;"
    string +=   "margin-bottom: 4px;"
    string += "}"
    string += "th {"
    string +=   "padding-bottom: 10px;"
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
    string += "tr.total-row td {"
    string +=   "font-weight: bold;"
    string +=   "padding-top: 10px;"
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
    string +=   "font-weight: bold;"
    string +=   "margin-bottom: 5px;"
    string += "}"
    string += ".address-block.first {"
    string +=   "margin-right: 50px;"
    string += "}"
    string += "</style>"
    string += "<div class=\"upper-right\">"
    string +=   "<div class=\"invoice-header\">INVOICE</div>"
    string +=   "Date Sent: #{self.sent_date.strftime("%-m/%-d/%y")}<br>"
    string +=   "Invoice Number: #{self.number}<br>"
    if invoice_type == "dvd"
      string += "PO Number: #{self.po_number}<br>"
      string += "Payment Terms: Net #{self.payment_terms} Days<br>"
      string += "Due Date: #{(self.sent_date + 30).strftime("%-m/%-d/%y")}<br />"
    end
    string += "<div class=\"upper-right-bold\">"
    string += "Please write invoice # on check<br />"
    string += "Federal Tax IDN: 46-4076413"
    string += "</div></div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "237 West 35th Street<br>"
    string += "Suite 604<br>"
    string += "New York, NY 10001<br>"
    string += "212.941.7744<br><br><br>"

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
    string += '</div><div class="address-block">'
    string += "<p>Ship To:</p>"
    string += "#{self.shipping_name}<br />"
    string += "#{self.shipping_address1}<br />"
    unless self.shipping_address2.empty?
      string += "#{self.shipping_address2}<br />"
    end
    string += "#{self.shipping_city}, #{self.shipping_state} #{self.shipping_zip}<br />"
    unless self.shipping_country == 'USA'
      string += "#{self.shipping_country}"
    end
    string += "</div>"

    string += "<table>"
    if self.invoice_type == "dvd"
      string += "<tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>"
    else
      booking = self.booking
      string += "<tr><th></th><th></th><th></th><th></th></tr>"
    end
    self.invoice_rows.each_with_index do |row, index|
      if index == 38 || ((index - 38) % 51 == 0)
        string += '</table><div class="page-break"><table><tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>'
      end
      string += "<tr>"
      if row.item_label == "Advance" || row.item_label[0..3] == "Owed"
        gross = row.item_label[5..-1] if row.item_label[0..3] == "Owed"
        string += "<td class='big-margin'>#{booking.film.title}<br>#{booking.start_date.strftime("%-m/%-d/%y")} - #{booking.end_date.strftime("%-m/%-d/%y")}<br>#{booking.screenings} screening#{booking.screenings > 1 ? 's' : ''}<br>#{booking.terms + (row.item_label[0..3] == "Owed" ? " #{row.item_label[5..-1]}" : "")}<br>#{booking.format.name}</td>"
      elsif row.item_label == "Shipping Fee"
        string += "<td class='big-margin'>#{row.item_label}</td>"
      else
        string += "<td>#{row.item_label}</td>"
      end
      if self.invoice_type == "dvd"
        string += "<td>#{dollarify(row.unit_price.to_s)}</td><td>#{row.item_qty}</td>"
      else
        string += "<td></td><td></td>"
      end
      if row.item_label == "Advance" || row.item_label[0..3] == "Owed"
        string += "<td class='big-margin'><br><br><br><br>#{dollarify(row.total_price.to_s)}</td>"
      elsif row.item_label == "Shipping Fee"
        string += "<td class='big-margin'>#{dollarify(row.total_price.to_s)}</td>"
      else
        string += "<td>#{dollarify(row.total_price.to_s)}</td>"
      end
      string += "</tr>"
    end
    string += "<tr class=\"total-row\"><td>Total (Net of all taxes and bank transfer expenses)</td><td></td><td></td><td>#{dollarify(self.total.to_s)}</td></tr>"
    string += "</table>"
    unless self.notes.empty?
      string += "<div class=\"notes\">"
      string += "<p>Notes:</p>"
      string += self.notes.gsub("\n", "<br />")
      string += "</div>"
    end
    string += "</div>"

    pdf = WickedPdf.new.pdf_from_string(string)
    save_path = "#{path}/Invoice #{self.number}.pdf"
    File.open(save_path, 'wb') do |f|
      f << pdf
    end
  end

  private

  def dollarify(input)
    input = number_with_precision(input, precision: 2, delimiter: ',').to_s
    if (input[0] == "-")
      '($' + input[1..-1] + ')'
    else
      '$' + input
    end
  end

end
