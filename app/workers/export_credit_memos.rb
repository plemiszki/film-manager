class ExportCreditMemos
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(credit_memo_ids, time_started)
    errors = []
    job = Job.find_by_job_id(time_started)
    job_folder = "#{Rails.root}/tmp/#{time_started}"
    FileUtils.mkdir_p("#{job_folder}")

    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet("Credit Memos")
    sheet.add_row([
      "Customer ID",
      "Customer Name",
      "Invoice/CM #",
      "Apply to Invoice Number",
      "Credit Memo",
      "Progress Billing Invoice",
      "Date",
      "Ship By",
      "Quote",
      "Quote #",
      "Quote Good Thru Date",
      "Drop Ship",
      "Ship to Name",
      "Ship to Address-Line One",
      "Ship to Address-Line Two",
      "Ship to City",
      "Ship to State",
      "Ship to Zipcode",
      "Ship to Country",
      "Customer PO",
      "Ship Via",
      "Ship Date",
      "Date Due",
      "Discount Amount",
      "Discount Date",
      "Displayed Terms",
      "Sales Representative ID",
      "Accounts Receivable Acccount",
      "Accounts Receivable Amount",
      "Sales Tax ID",
      "Invoice Note",
      "Note Prints After Line Items",
      "Statement Note",
      "Stmt Note Prints Before Ref",
      "Internal Note",
      "Beginning Balance Transaction",
      "AR Date Cleared in Bank Rec",
      "Number of Distributions",
      "Invoice/CM Distribution",
      "Apply to Invoice Distribution",
      "Apply to Sales Order",
      "Apply to Proposal",
      "Quantity",
      "SO/Proposal Number",
      "Item ID",
      "Serial Number",
      "SO/Proposal Distribution",
      "Description",
      "G/L Account",
      "GL Date Cleared in Bank Rec",
      "Unit Price",
      "Tax Type",
      "UPC / SKU",
      "Weight",
      "Amount",
      "Inventory Account",
      "Inv Acnt Date Cleared In Bank Rec",
      "Cost of Sales Account",
      "COS Acnt Date Cleared In Bank Rec",
      "U/M ID",
      "U/M No. of Stocking Units",
      "Stocking Quantity",
      "Stocking Unit Price",
      "Cost of Sales Amount",
      "Job ID",
      "Sales Tax Agency ID",
      "Transaction Period",
      "Transaction Number",
      "Receipt Number",
      "Return Authorization",
      "Voided by Transaction",
      "Retainage Percent",
      "Recur Number",
      "Recur Frequency"
    ])

    credit_memos = CreditMemo.where(id: credit_memo_ids).order(:id)
    credit_memos.each_with_index do |credit_memo, credit_memo_index|
      items = credit_memo.credit_memo_rows
      items.each_with_index do |item, index|
        film = item.dvd.feature
        sheet.add_row([
          credit_memo.customer.sage_id,
          '',
          credit_memo.number,
          '',
          'TRUE',
          '',
          credit_memo.sent_date,
          '',
          '',
          '', # 10
          '',
          'FALSE',
          credit_memo.billing_name,
          credit_memo.billing_address1,
          credit_memo.billing_address2,
          credit_memo.billing_city,
          credit_memo.billing_state,
          credit_memo.billing_zip,
          credit_memo.billing_country,
          credit_memo.return_number, # 20
          '',
          '',
          '',
          '', '',
          '',
          '',
          '10200',
          '', '', '', '', '', '', '',
          'FALSE',
          '',
          items.length,
          index,
          '', # 40
          'FALSE',
          'FALSE',
          item.item_qty,
          '', '', '', '',
          item.item_label,
          '30200',
          '', # 50
          (item.unit_price * -1),
          '1',
          '', '',
          (item.total_price * -1),
          '', '', '', '', '',
          '1',
          '', '', '',
          film.get_sage_id
        ])
      end
      job.update({ current_value: credit_memo_index + 1 })
    end

    file_path = "#{job_folder}/credit_memos.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup

    job.update({ first_line: "Uploading to AWS" })
    s3 = Aws::S3::Resource.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1'
    )
    bucket = s3.bucket(ENV['S3_BUCKET'])
    obj = bucket.object("#{time_started}/credit_memos.xlsx")
    obj.upload_file(file_path, acl:'public-read')
    job.update!({ status: :success, metadata: { url: obj.public_url } })
  end

end
