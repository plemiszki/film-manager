class Api::CreditMemosController < AdminController

  include ActionView::Helpers::NumberHelper
  include ApplicationHelper

  def index
    @credit_memos = CreditMemo.all.order('id DESC').includes(:customer)
    @credit_memos = @credit_memos.limit(100) unless params[:all]
    render "index.json.jbuilder"
  end

  # def create
  #   booking = Booking.find(params[:booking_id])
  #   calculations = booking_calculations(booking)
  #   total = get_total(params, booking, calculations)
  #   invoice = CreditMemo.create!(
  #     invoice_type: 'booking',
  #     sent_date: Date.today,
  #     number: "#{Setting.first.next_booking_invoice_number}B",
  #     billing_name: booking.billing_name,
  #     billing_address1: booking.billing_address1,
  #     billing_address2: booking.billing_address2,
  #     billing_city: booking.billing_city,
  #     billing_state: booking.billing_state,
  #     billing_zip: booking.billing_zip,
  #     billing_country: booking.billing_country,
  #     shipping_name: booking.shipping_name,
  #     shipping_address1: booking.shipping_address1,
  #     shipping_address2: booking.shipping_address2,
  #     shipping_city: booking.shipping_city,
  #     shipping_state: booking.shipping_state,
  #     shipping_zip: booking.shipping_zip,
  #     shipping_country: booking.shipping_country,
  #     total: total,
  #     booking_id: booking.id,
  #     notes: booking.notes
  #   )
  #   CreditMemoRow.create!(invoice_id: invoice.id, item_label: 'Advance', item_qty: 1, total_price: booking.advance) if params[:advance] == "true"
  #   CreditMemoRow.create!(invoice_id: invoice.id, item_label: "Overage (Total Gross: #{dollarify(number_with_precision(calculations[:total_gross], precision: 2, delimiter: ','))})", item_qty: 1, total_price: calculations[:overage]) if params[:overage] == "true"
  #   CreditMemoRow.create!(invoice_id: invoice.id, item_label: 'Shipping Fee', item_qty: 1, total_price: booking.shipping_fee) if params[:ship_fee] == "true"
  #   if params[:payment_ids]
  #     params[:payment_ids].each do |payment_id|
  #       payment = Payment.find(payment_id)
  #       CreditMemoPayment.create!(invoice_id: invoice.id, payment_id: payment_id, amount: payment.amount, date: payment.date, notes: payment.notes)
  #     end
  #   end
  #   SendBookingCreditMemo.perform_async(invoice.id, current_user.id, booking.email, params[:advance], params[:overage], (params[:advance] && booking.booking_type.strip != "Theatrical"))
  #   settings = Setting.first
  #   settings.update(next_booking_invoice_number: settings.next_booking_invoice_number + 1)
  #   @invoices = booking.invoices.includes(:invoice_rows)
  #   render 'booking.json.jbuilder'
  # end

  def show
    @credit_memo = CreditMemo.find(params[:id])
    @rows = @credit_memo.credit_memo_rows
    render 'show.json.jbuilder'
  end

  # def export
  #   invoice = CreditMemo.find(params[:id])
  #   pathname = Rails.root.join('tmp', Time.now.to_s)
  #   FileUtils.mkdir_p("#{pathname}")
  #   invoice.export!(pathname)
  #   File.open("#{pathname}/CreditMemo #{invoice.number}.pdf", 'r') do |f|
  #     send_data f.read, filename: "CreditMemo #{invoice.number}.pdf"
  #   end
  # end

  # def export_sage
  #   invoice_ids = params[:invoice_ids].to_a.map(&:to_i)
  #   time_started = Time.now.to_s
  #   job = Job.create!(job_id: time_started, name: "export invoices", first_line: "Exporting CreditMemos", second_line: true, current_value: 0, total_value: invoice_ids.length)
  #   ExportCreditMemos.perform_async(invoice_ids, time_started)
  #   render json: job
  # end

  private

  def get_total(params, booking, calculations)
    total = 0
    total += booking.advance if params[:advance] == "true"
    total += calculations[:overage] if params[:overage] == "true"
    total += booking.shipping_fee if params[:ship_fee] == "true"
    total
  end

end
