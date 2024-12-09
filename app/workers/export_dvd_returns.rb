class ExportDvdReturns
  include Sidekiq::Worker
  include ExportSpreadsheetHelpers
  sidekiq_options retry: false

  HEADERS = [
    "Date",
    "Number",
    "Customer",
    "Licensor",
    "Film Title",
    "UPC",
    "Type",
    "Price",
    "Qty",
    "Total"
  ]

  def perform(return_ids, time_started)
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    file_path = "#{job_folder}/returns.xlsx"
    FileUtils.mkdir_p("#{job_folder}")

    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(:name => "DVD Returns") do |sheet|
        add_row(sheet, HEADERS)
        returns = Return.where(id: return_ids).order(:id)
        returns.each_with_index do |rtn, rtn_index|
          items = rtn.return_items
          items.each_with_index do |item, index|
            customer = rtn.customer
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
              rtn.date.strftime("%m/%d/%Y"),
              rtn.number,
              customer.name,
              licensor ? licensor.name : '',
              item.item_type == 'dvd' ? feature.title : giftbox.name,
              item.item_type == 'dvd' ? dvd.upc : giftbox.upc,
              item.item_type == 'dvd' ? dvd.dvd_type.name : '',
              price,
              item.qty,
              (price * item.qty)
            ])
          end
          job.update({ current_value: rtn_index + 1 })
        end
        p.serialize(file_path)
      end
    end

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/returns.xlsx")
    obj.upload_file(file_path, acl:'public-read')
    job.update!({ status: :success, metadata: { url: obj.public_url } })
  end

end
