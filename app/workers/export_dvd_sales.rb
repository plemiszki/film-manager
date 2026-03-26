class ExportDvdSales
  include Sidekiq::Worker

  sidekiq_options retry: false

  HEADERS = [
    "PO Date",
    "PO Number",
    "Customer",
    "Licensor",
    "Film Title",
    "UPC",
    "Type",
    "Price",
    "Qty",
    "Total",
    "Ship Date"
  ]

  def perform(_, args = {})
    job = Job.find_by_job_id(args["time_started"])

    start_date = Date.strptime(args["start_date"], "%m/%d/%y")
    end_date   = Date.strptime(args["end_date"], "%m/%d/%y")

    orders = PurchaseOrder.where(order_date: start_date..end_date).includes(:customer)
    rows = []
    orders.each do |order|
      next if !order.ship_date || order.customer_id == 0
      order.purchase_order_items.each do |item|
        customer = order.customer
        if item.item_type == 'dvd'
          dvd = item.item
          price = Invoice.get_item_price(dvd.id, 'dvd', customer).to_f
          feature = dvd.feature
          licensor = feature.licensor
        else
          giftbox = item.item
          price = Invoice.get_item_price(giftbox.id, 'giftbox', customer).to_f
        end
        rows << [
          order.order_date.strftime("%m/%d/%y"),
          order.number,
          customer.name,
          licensor ? licensor.name : '',
          item.item_type == 'dvd' ? feature.title : giftbox.name,
          item.item_type == 'dvd' ? dvd.upc : giftbox.upc,
          item.item_type == 'dvd' ? dvd.dvd_type.name : '',
          price,
          item.qty,
          (price * item.qty),
          order.ship_date
        ]
      end
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:              HEADERS,
      rows:                 rows,
      job:                  job,
      filename:             'sales.xlsx',
      increment_job_column: 'PO Number'
    ).call

    job.update!({ status: :success, metadata: { url: public_url } })
  end

end
