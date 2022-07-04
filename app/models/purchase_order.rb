class PurchaseOrder < ActiveRecord::Base

  validates :number, presence: true
  validates :order_date, date: true
  validates :ship_date, date: { blank_ok: true }

  after_validation :set_month_and_year, on: [:create, :update]

  def set_month_and_year
    if self.errors.empty?
      self.month = self.order_date.month
      self.year = self.order_date.year
    end
  end

  has_many :purchase_order_items, dependent: :destroy
  has_many :items, through: :purchase_order_items
  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id,
    primary_key: :id
  )
  belongs_to(
    :invoice,
    class_name: "Invoice",
    foreign_key: :number,
    primary_key: :po_number
  )

  def self.fill_in
    pos = PurchaseOrder.all
    pos.each do |po|
      po.update(month: po.order_date.month)
    end
  end

  def resend_shipping_files(sender_email)
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    self.create_shipping_files(pathname, self.source_doc)
    attachments = [File.open("#{pathname}/#{source_doc}_worderline.txt", "r"), File.open("#{pathname}/#{source_doc}_worder.txt", "r")]
    message_params = {
      from: sender_email,
      to: 'fulfillment@theadsgroup.com',
      cc: sender_email,
      subject: "Film Movement Sales Order #{self.source_doc}",
      text: "Please see attached shipping files.",
      attachment: attachments
    }
    mg_client.send_message 'filmmovement.com', message_params unless Rails.env.test?
  end

  def create_shipping_files(pathname, source_doc)
    save_path = "#{pathname}/#{source_doc}_worderline.txt"
    File.open(save_path, 'wb') do |f|
      content = ""
      purchase_order_items.each_with_index do |item, index|
        content += "\"SourceDoc|ItemId|LineNo|QtyOrder|UOMCode|;#{source_doc}|#{item.item.upc}|#{index}|#{item.qty}|EA\"\n"
      end
      f << content
    end
    save_path = "#{pathname}/#{source_doc}_worder.txt"
    File.open(save_path, 'wb') do |f|
      f << "\"SourceDoc|SrcPO|ChargeCust|OrderDate|ShipToName|Address1|Address2|City|State|ZipCode|Country|ShipToPhone|Remarks|ShipToEmail|CarrierID|;#{source_doc}|#{number}|033|#{Date.today.strftime("%-m/%-d/%Y")}|#{name}|#{address1}|#{address2}|#{city}|#{state}|#{zip}|#{country}||||700\""
    end
  end

  def decrement_stock!
    purchase_order_items.each do |item|
      if item.item_type == "dvd"
        dvd = Dvd.find(item.item_id)
        dvd.update({ stock: [dvd.stock - item.qty, 0].max, units_shipped: dvd.units_shipped + item.qty })
      else
        giftbox = Giftbox.find(item.item_id)
        giftbox.update({ quantity: [giftbox.quantity - item.qty, 0].max })
      end
    end
  end

end
