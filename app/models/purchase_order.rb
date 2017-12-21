class PurchaseOrder < ActiveRecord::Base

  validates :number, presence: true
  validates_date :order_date
  validates_date :ship_date, allow_blank: true

  has_many :purchase_order_items
  has_many :items, through: :purchase_order_items
  belongs_to(
    :customer,
    class_name: "DvdCustomer",
    foreign_key: :customer_id,
    primary_key: :id
  )

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
