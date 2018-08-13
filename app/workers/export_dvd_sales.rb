class ExportDvdSales
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(time_started, start_date, end_date)
    errors = []
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet("DVD Sales")
    sheet.add_row([
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
    ])

    orders = PurchaseOrder.where(order_date: start_date..end_date).includes(:customer)
    orders.each_with_index do |order, order_index|
      next if !order.ship_date
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
        sheet.add_row([
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

    file_path = "#{job_folder}/sales.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/sales.xlsx")
    obj.upload_file(file_path, acl:'public-read')
    job.update!({ done: true, first_line: errors.empty? ? obj.public_url : "Errors Found", errors_text: errors.empty? ? "" : errors.uniq.join("\n") })
  end

end
