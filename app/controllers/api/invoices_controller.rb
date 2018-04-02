class Api::InvoicesController < AdminController

  def index
    @invoices = Invoice.all.order('id DESC')
    @invoices = @invoices.limit(100) unless params[:all]
    render "index.json.jbuilder"
  end

  def show
    @invoices = Invoice.where(id: params[:id]).includes(booking: [:film, :venue])
    @rows = @invoices.first.invoice_rows
    render "show.json.jbuilder"
  end

  def export
    invoice = Invoice.find(params[:id])
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    invoice.export!(pathname)
    File.open("#{pathname}/Invoice #{invoice.number}.pdf", 'r') do |f|
      send_data f.read, filename: "Invoice #{invoice.number}.pdf"
    end
  end

  def export_sage
    invoice_ids = params[:invoice_ids].to_a.map(&:to_i)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export invoices", first_line: "Exporting Invoices", second_line: true, current_value: 0, total_value: invoice_ids.length)
    ExportInvoices.perform_async(invoice_ids, time_started)
    render json: job
  end

end
