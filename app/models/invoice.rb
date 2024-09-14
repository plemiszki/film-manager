class Invoice < ActiveRecord::Base

  DVDS_ON_FIRST_PAGE = 37
  DVDS_PER_PAGE = 46

  include Dollarify

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :invoice_type, :number, presence: true
  validates :number, uniqueness: true
  validates :sent_date, date: { blank_ok: true }
  validates :stripe_id, uniqueness: { allow_blank: true }

  has_many :invoice_rows, -> { order('invoice_rows.id') }, dependent: :destroy
  has_many :invoice_payments, -> { order('invoice_payments.id') }, dependent: :destroy
  belongs_to :customer, class_name: 'DvdCustomer'
  belongs_to :booking, polymorphic: true

  belongs_to :institution
  belongs_to :institution_order

  alias_attribute :rows, :invoice_rows

  scope :bookings, -> { where(invoice_type: 'booking') }
  scope :dvds, -> { where(invoice_type: 'dvd') }

  def self.fill_num_column!
    self.all.each do |invoice|
      invoice.update(num: invoice.number[0..-2])
    end
  end

  def billing_address
    return <<~HEREDOC
      #{self.billing_name}
      #{self.billing_address1}#{self.billing_address2.present? ? "\n#{self.billing_address2}" : nil}
      #{self.billing_city}, #{self.billing_state} #{self.billing_zip}
      #{self.billing_country}
    HEREDOC
  end

  def shipping_address
    return <<~HEREDOC
      #{self.shipping_name}
      #{self.shipping_address1}#{self.shipping_address2.present? ? "\n#{self.shipping_address2}" : nil}
      #{self.shipping_city}, #{self.shipping_state} #{self.shipping_zip}
      #{self.shipping_country}
    HEREDOC
  end

  def total_minus_payments
    if invoice_type == 'booking'
      total - invoice_payments.reduce(0) { |sum, ip| sum += ip.amount }
    else
      total
    end
  end

  def invoice_type_display_text
    case invoice_type
    when "dvd"
      "DVD"
    else
      invoice_type.titleize
    end
  end

  def self.create_invoice_from_po(purchase_order, args = {})
    dvd_customer = purchase_order.customer
    data = {
      from: purchase_order,
      invoice_type: 'dvd',
      customer_id: purchase_order.customer_id,
      number: "#{Setting.first.next_dvd_invoice_number}D",
      num: Setting.first.next_dvd_invoice_number,
      sent_date: Date.today,
      po_number: purchase_order.number,
      billing_name: dvd_customer.billing_name,
      billing_address1: dvd_customer.address1,
      billing_address2: dvd_customer.address2,
      billing_city: dvd_customer.city,
      billing_state: dvd_customer.state,
      billing_zip: dvd_customer.zip,
      billing_country: dvd_customer.country,
      shipping_name: purchase_order.name,
      shipping_address1: purchase_order.address1,
      shipping_address2: purchase_order.address2,
      shipping_city: purchase_order.city,
      shipping_state: purchase_order.state,
      shipping_zip: purchase_order.zip,
      shipping_country: purchase_order.country,
      payment_terms: dvd_customer.payment_terms,
      notes: purchase_order.notes
    }.merge(args)
    Invoice.create_invoice(data)
  end

  def self.create_invoice(args)
    if args[:from].class.to_s == "PurchaseOrder"
      purchase_order = args[:from]
      dvd_customer = DvdCustomer.find(purchase_order.customer_id)
      args.delete(:from)
      invoice = Invoice.create!(args)
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

  def create_in_stripe!
    if dvd_customer = self.customer
      raise "dvd customer #{dvd_customer.name} is missing stripe ID" if dvd_customer.stripe_id.blank?
      stripe_customer = dvd_customer
    elsif institution = self.institution
      raise "institution #{institution.label} is missing stripe ID" if institution.stripe_id.blank?
      stripe_customer = institution
    else
      raise "invoice #{self.number} is a booking invoice"
    end

    invoice_params = {
      collection_method: 'send_invoice',
      customer: stripe_customer.stripe_id,
      number: self.number,
      shipping_details: {
        name: self.shipping_name,
        address: {
          line1: self.shipping_address1,
          line2: self.shipping_address2,
          city: self.shipping_city,
          state: self.shipping_state,
          postal_code: self.shipping_zip,
        },
      },
    }

    if dvd_customer
      invoice_params.merge!({
        description: "PO Number: #{self.po_number}",
        due_date: (self.sent_date + self.payment_terms).to_time.to_i,
      })
    elsif institution
      invoice_params.merge!({
        due_date: (self.sent_date + 30).to_time.to_i,
      })
    end

    stripe_invoice = Stripe::Invoice.create(invoice_params)
    self.update!(stripe_id: stripe_invoice.id)
    self.rows.each do |row|
      invoice_row_params = {
        customer: stripe_customer.stripe_id,
        invoice: stripe_invoice.id,
        description: row.item_label,
        quantity: row.item_qty,
      }

      if dvd_customer
        invoice_row_params.merge!({
          unit_amount: row.unit_price_cents,
        })
      elsif institution
        invoice_row_params.merge!({
          unit_amount: row.total_price_cents,
        })
      end

      response = Stripe::InvoiceItem.create(invoice_row_params)
    end
  end

  def email_through_stripe!
    raise "no stripe ID" if self.stripe_id.blank?
    Stripe::Invoice.send_invoice(self.stripe_id)
  end

  def export!(path)
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
    string +=   "width: 200px;"
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
    string +=   "<div class=\"invoice-header\">INVOICE</div>"
    string +=   "Date Sent: #{self.sent_date.strftime("%-m/%-d/%Y")}<br>"
    string +=   "Invoice Number: #{self.number}<br>"
    if invoice_type == "dvd"
      string += "PO Number: #{self.po_number}<br>"
      string += "Payment Terms: Net #{self.payment_terms} Days<br>"
      string += "Due Date: #{(self.sent_date + 30).strftime("%-m/%-d/%Y")}<br />"
    end
    string += "<div class=\"upper-right-bold\">"
    string += "Please write the invoice number on your check"
    string += "</div></div>"
    string += "<div class=\"film-movement\">Film Movement</div>"
    string += "505 8th Avenue<br>"
    string += "Suite 1102<br>"
    string += "New York, NY 10018<br>"
    string += "212.941.7744<br>"
    string += "Federal Tax IDN: 46-4076413<br>"
    string += "<br><br>"

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

    if self.shipping_address1.present?
      string += '<div class="address-block">'
      string += '<p>Ship To:</p>'
      string += "#{self.shipping_name}<br />"
      string += "#{self.shipping_address1}<br />"
      if self.shipping_address2.present?
        string += "#{self.shipping_address2}<br />"
      end
      string += "#{self.shipping_city}, #{self.shipping_state} #{self.shipping_zip}<br />"
      unless self.shipping_country == 'USA'
        string += "#{self.shipping_country}"
      end
      string += '</div>'
    end

    string += "<table>"
    if self.invoice_type == "dvd"
      string += "<tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>"
    else
      booking = self.booking
      string += "<tr><th></th><th></th><th></th><th></th></tr>"
    end
    total_dvds = 0
    self.invoice_rows.each_with_index do |row, index|
      if index == DVDS_ON_FIRST_PAGE || ((index - DVDS_ON_FIRST_PAGE) % DVDS_PER_PAGE == 0)
        string += '</table><div class="page-break"><table><tr><th>Item</th><th>Unit Price</th><th>Qty</th><th>Total Price</th></tr>'
      end
      string += "<tr>"

      # item description
      description_text = row.try(:item_label_export) || row.item_label
      if row.item_label == "Advance" || row.item_label == "Overage"
        string += "<td class='big-margin'>#{booking.film.title}<br>#{booking.start_date.strftime("%-m/%-d/%Y")} - #{booking.end_date.strftime("%-m/%-d/%Y")}<br>#{booking.screenings} screening#{booking.screenings > 1 ? 's' : ''}<br>#{booking.terms + (row.item_label == "Overage" ? " #{row.item_label_export[7..-1]}" : "")}<br>#{booking.format.name}<br>"
        string += "Premiere: #{booking.premiere}<br>" unless booking.premiere.empty?
        string += '</td>'
      elsif row.item_label == "Shipping Fee"
        string += "<td class='big-margin'>#{row.item_label}</td>"
      else
        string += "<td>#{description_text.gsub("\n", '<br />')}</td>"
      end

      # unit price and qty columns (for DVD invoices)
      if self.invoice_type == "dvd"
        total_dvds += row.item_qty
        string += "<td>#{dollarify(row.unit_price.to_s)}</td><td>#{row.item_qty}</td>"
      else
        string += "<td></td><td></td>"
      end

      # total price column
      break_tag_count = description_text.count("\n")
      break_tags = ('<br />' * break_tag_count)
      if row.item_label == "Advance" || row.item_label == "Overage"
        string += "<td class='big-margin'><br><br><br><br>#{dollarify(row.total_price.to_s)}</td>"
      elsif row.item_label == "Shipping Fee"
        string += "<td class='big-margin'>#{dollarify(row.total_price.to_s)}</td>"
      else
        string += "<td>#{break_tags}#{dollarify(row.total_price.to_s)}</td>"
      end

      string += "</tr>"
    end
    if self.invoice_type == 'booking'
      self.invoice_payments.each_with_index do |payment, index|
        string += "<tr>"
        string += "<td class=\"big-margin\">Payment#{!payment.notes.empty? ? " - #{payment.notes}" : ''} (#{payment.date.strftime("%-m/%-d/%Y")})</td><td></td><td></td><td class=\"big-margin\">#{dollarify((payment.amount * -1).to_s)}</td>"
        string += "</tr>"
      end
    end
    string += "<tr class=\"total-row\"><td>Total (Net of all taxes and bank transfer expenses)</td><td></td><td>#{self.invoice_type == "dvd" ? "#{total_dvds}" : ""}</td><td>#{dollarify(self.total_minus_payments.to_s)}</td></tr>"
    string += "</table>"
    if self.notes.present?
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

end
