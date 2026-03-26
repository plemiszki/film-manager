class ExportDvdReturns
  include Sidekiq::Worker

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

    returns = Return.where(id: return_ids).order(:id)
    rows = []
    returns.each do |rtn|
      rtn.return_items.each do |item|
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
        rows << [
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
        ]
      end
    end

    public_url = ExportAndUploadSpreadsheet.new(
      headers:              HEADERS,
      rows:                 rows,
      job:                  job,
      filename:             'returns.xlsx',
      increment_job_column: 'Number'
    ).call

    job.update!({ status: :success, metadata: { url: public_url } })
  end

end
