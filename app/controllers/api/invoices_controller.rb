class Api::InvoicesController < ApplicationController

  def index
    @invoices = Invoice.all
    render "index.json.jbuilder"
  end

  def show
    @invoices = Invoice.where(id: params[:id])
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

end
