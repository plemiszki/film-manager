class Api::InvoicesController < AdminController

  include BookingCalculations
  include ActionView::Helpers::NumberHelper
  include ApplicationHelper

  MAX_PAGE_LINKS = 10

  def index

    batch_size = params[:batch_size].to_i
    page = params[:page].to_i
    offset = batch_size * (page - 1)
    order_column = params[:order_by]
    order_direction = params[:order_direction]
    order_string = order_column
    order_string += ' DESC' if order_direction == 'desc'

    if params[:search_criteria]
      where_obj = {}
      params[:search_criteria].each do |key, value|
        key = value['db_name'] if value['db_name']
        if value['min_value']
          where_obj[key] = Range.new(value['min_value'].to_i, value['max_value'].to_i)
        elsif value['start_date']
          convert_date = -> (string) { Date.strptime(string, "%m/%d/%y") }
          where_obj[key] = Range.new(convert_date.(value['start_date']), convert_date.(value['end_date']))
        else
          where_obj[key] = value['value']
        end
      end
      invoices_meeting_search_criteria = Invoice.where(where_obj)
      if invoices_meeting_search_criteria.length == 0
        invoices_meeting_search_criteria = Invoice.fuzzy_search(where_obj)
      end
    else
      invoices_meeting_search_criteria = Invoice.all
    end

    @invoices = invoices_meeting_search_criteria.order(order_string).limit(batch_size).offset(offset)

    total_count = invoices_meeting_search_criteria.to_a.count # <-- casting to array avoids fuzzy_search error
    pages_count = total_count / batch_size
    pages_count += 1 if total_count % batch_size > 0

    @page_numbers = [page]
    index = 1
    while @page_numbers.length < [pages_count, MAX_PAGE_LINKS].min do
      @page_numbers << (page + index)
      @page_numbers << (page - index)
      @page_numbers.select! { |page| page > 0 && page <= pages_count }
      index += 1
    end
    @page_numbers.sort!
    @more_pages = pages_count > @page_numbers[-1]
    render 'index.json.jbuilder'
  end

  def create
    booking = Booking.find(params[:booking_id])
    calculations = booking_calculations(booking)
    total = get_total(params, booking, calculations)
    invoice = Invoice.create!(
      invoice_type: 'booking',
      sent_date: Date.today,
      number: "#{Setting.first.next_booking_invoice_number}B",
      num: Setting.first.next_booking_invoice_number,
      billing_name: booking.billing_name,
      billing_address1: booking.billing_address1,
      billing_address2: booking.billing_address2,
      billing_city: booking.billing_city,
      billing_state: booking.billing_state,
      billing_zip: booking.billing_zip,
      billing_country: booking.billing_country,
      shipping_name: booking.shipping_name,
      shipping_address1: booking.shipping_address1,
      shipping_address2: booking.shipping_address2,
      shipping_city: booking.shipping_city,
      shipping_state: booking.shipping_state,
      shipping_zip: booking.shipping_zip,
      shipping_country: booking.shipping_country,
      total: total,
      booking_id: booking.id,
      notes: booking.notes
    )
    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Advance', item_qty: 1, total_price: booking.advance) if params[:advance] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: "Overage (Total Gross: #{dollarify(number_with_precision(calculations[:total_gross], precision: 2, delimiter: ','))})", item_qty: 1, total_price: calculations[:overage]) if params[:overage] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Shipping Fee', item_qty: 1, total_price: booking.shipping_fee) if params[:ship_fee] == "true"
    if params[:payment_ids]
      params[:payment_ids].each do |payment_id|
        payment = Payment.find(payment_id)
        InvoicePayment.create!(invoice_id: invoice.id, payment_id: payment_id, amount: payment.amount, date: payment.date, notes: payment.notes)
      end
    end
    SendBookingInvoice.perform_async(invoice.id, current_user.id, booking.email, params[:advance], params[:overage], (params[:advance] && booking.booking_type.strip != "Theatrical"))
    settings = Setting.first
    settings.update(next_booking_invoice_number: settings.next_booking_invoice_number + 1)
    @invoices = booking.invoices.includes(:invoice_rows)
    render 'booking.json.jbuilder'
  end

  def update
    invoice = Invoice.find_by_number(params[:id])
    booking = Booking.find(params[:booking_id])
    calculations = booking_calculations(booking)
    total = get_total(params, booking, calculations)
    invoice.update!(
      billing_name: booking.billing_name,
      billing_address1: booking.billing_address1,
      billing_address2: booking.billing_address2,
      billing_city: booking.billing_city,
      billing_state: booking.billing_state,
      billing_zip: booking.billing_zip,
      billing_country: booking.billing_country,
      shipping_name: booking.shipping_name,
      shipping_address1: booking.shipping_address1,
      shipping_address2: booking.shipping_address2,
      shipping_city: booking.shipping_city,
      shipping_state: booking.shipping_state,
      shipping_zip: booking.shipping_zip,
      shipping_country: booking.shipping_country,
      total: total,
      notes: booking.notes
    )
    invoice.invoice_rows.destroy_all
    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Advance', item_qty: 1, total_price: booking.advance) if params[:advance] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: "Overage (Total Gross: #{dollarify(number_with_precision(calculations[:total_gross], precision: 2, delimiter: ','))})", item_qty: 1, total_price: calculations[:overage]) if params[:overage] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Shipping Fee', item_qty: 1, total_price: booking.shipping_fee) if params[:ship_fee] == "true"
    InvoicePayment.where(invoice_id: invoice.id).destroy_all
    if params[:payment_ids]
      params[:payment_ids].each do |payment_id|
        payment = Payment.find(payment_id)
        InvoicePayment.create!(invoice_id: invoice.id, payment_id: payment_id, amount: payment.amount, date: payment.date, notes: payment.notes)
      end
    end
    SendBookingInvoice.perform_async(invoice.id, current_user.id, booking.email, params[:advance], params[:overage], (params[:advance] && booking.booking_type.strip != "Theatrical"))
    @invoices = booking.invoices.includes(:invoice_rows)
    render 'booking.json.jbuilder'
  end

  def show
    @invoices = Invoice.where(id: params[:id]).includes(booking: [:film, :venue])
    invoice = @invoices.first
    @rows = invoice.invoice_rows
    @payments = invoice.invoice_payments if invoice.invoice_type == 'booking'
    render 'show.json.jbuilder'
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

  private

  def get_total(params, booking, calculations)
    total = 0
    total += booking.advance if params[:advance] == "true"
    total += calculations[:overage] if params[:overage] == "true"
    total += booking.shipping_fee if params[:ship_fee] == "true"
    total
  end

end
