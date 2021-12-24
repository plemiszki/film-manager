module PurchaseOrderItems
  extend ActiveSupport::Concern

  def get_data_for_items
    @items = @purchase_order.purchase_order_items.map do |item|
      result = {}
      result[:id] = item.id
      result[:item_type] = item.item_type
      result[:qty] = item.qty
      result[:order] = item.order
      thing = item.item
      result[:item_id] = thing.id
      if item.item_type == "dvd"
        result[:label] = "#{thing.feature.title} - #{thing.dvd_type.name}"
        result[:stock] = thing.stock
      else
        result[:label] = thing.name
        result[:stock] = thing.on_demand ? 'n/a' : thing.quantity
      end
      result
    end
    other_dvds = Dvd.includes(:feature, :dvd_type)
    other_dvds = other_dvds.map do |dvd|
      fmt = dvd.dvd_type.name
      title = dvd.feature.title
      dvd = dvd.attributes
      dvd[:item_type] = "dvd"
      dvd[:label] = "#{title} - #{fmt}"
      dvd
    end
    other_giftboxes = Giftbox.all
    other_giftboxes = other_giftboxes.map do |giftbox|
      giftbox = giftbox.attributes
      giftbox[:item_type] = "giftbox"
      giftbox[:label] = giftbox["name"]
      giftbox
    end
    @other_items = (other_dvds + other_giftboxes).sort_by { |item| item[:label] }
    @items.each do |item|
      other_item_to_delete = @other_items.select { |other_item| other_item['id'] == item[:item_id] && other_item[:item_type] == item[:item_type] }.first
      @other_items.delete(other_item_to_delete)
    end
    @dvd_customers = DvdCustomer.all.order(:name)
    @selected_dvd_customer = (@purchase_order.customer_id == 0 ? nil : @dvd_customers.find(@purchase_order.customer_id))
  end

end
