class ExportDvdSales
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
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
    job_folder = "#{Rails.root}/tmp/#{args["time_started"]}"
    FileUtils.mkdir_p("#{job_folder}")
    file_path = "#{job_folder}/sales.xlsx"

    start_date = Date.strptime(args["start_date"], "%m/%d/%y")
    end_date = Date.strptime(args["end_date"], "%m/%d/%y")

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "DVD Sales") do |sheet|
        add_row(sheet, HEADERS)
        orders = PurchaseOrder.where(order_date: start_date..end_date).includes(:customer)
        orders.each_with_index do |order, order_index|
          next if !order.ship_date || order.customer_id == 0
          items = order.purchase_order_items
          items.each_with_index do |item, index|
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
            add_row(sheet, [
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
            ])
          end
          job.update({ current_value: order_index + 1 })
        end
        p.serialize(file_path)
      end
    end

    job.update({ first_line: "Uploading to AWS", second_line: false })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{args["time_started"]}/sales.xlsx")
    obj.upload_file(file_path, acl:'public-read')
    job.update!({ status: :success, metadata: { url: obj.public_url } })
  end

end
