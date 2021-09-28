class Api::InvoicesController < AdminController

  include BookingCalculations
  include ActionView::Helpers::NumberHelper
  include ApplicationHelper
  include SearchIndex

  def index
    @invoices = perform_search(model: 'Invoice')
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def create
    is_virtual_booking = params[:booking_type] == 'virtualBooking'
    booking = (is_virtual_booking ? VirtualBooking.find(params[:booking_id]) : Booking.find(params[:booking_id]))
    calculations = booking_calculations(booking)
    total = get_total(params, booking, calculations)
    new_invoice_data = {
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
      total: total,
      booking_id: booking.id,
      booking_type: (is_virtual_booking ? 'VirtualBooking' : 'Booking'),
      notes: booking.try(:notes)
    }
    unless is_virtual_booking
      new_invoice_data.merge!({
        shipping_name: booking.try(:shipping_name),
        shipping_address1: booking.try(:shipping_address1),
        shipping_address2: booking.try(:shipping_address2),
        shipping_city: booking.try(:shipping_city),
        shipping_state: booking.try(:shipping_state),
        shipping_zip: booking.try(:shipping_zip),
        shipping_country: booking.try(:shipping_country),
      })
    end

    invoice = Invoice.create!(new_invoice_data)

    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Advance', item_qty: 1, total_price: booking.advance) if params[:advance] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: "Overage (Total Gross: #{dollarify(number_with_precision(calculations[:total_gross], precision: 2, delimiter: ','))})", item_qty: 1, total_price: calculations[:overage]) if params[:overage] == "true"
    InvoiceRow.create!(invoice_id: invoice.id, item_label: 'Shipping Fee', item_qty: 1, total_price: booking.shipping_fee) if params[:ship_fee] == "true"

    if params[:rows]
      params.permit(rows: [:label, :label_export, :amount])[:rows].each do |row|
        InvoiceRow.create!(
          invoice_id: invoice.id,
          item_label: row[:label],
          item_label_export: row[:label_export],
          item_qty: 1,
          unit_price: row[:amount],
          total_price: row[:amount]
        )
      end
    end

    if params[:payment_ids]
      params[:payment_ids].each do |payment_id|
        payment = Payment.find(payment_id)
        InvoicePayment.create!(invoice_id: invoice.id, payment_id: payment_id, amount: payment.amount, date: payment.date, notes: payment.notes)
      end
    end

    SendBookingInvoice.perform_async(0,
      invoice_id: invoice.id,
      user_id: current_user.id,
      email: booking.email,
      overage: params[:overage],
      shipping_terms: (params[:advance] && booking.booking_type.strip != "Theatrical")
    )

    settings = Setting.first
    settings.update(next_booking_invoice_number: settings.next_booking_invoice_number + 1)
    @invoices = booking.invoices.includes(:invoice_rows)
    render 'booking', formats: [:json], handlers: [:jbuilder]
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
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def destroy
    invoice = Invoice.find(params[:id])
    invoice.destroy
    booking = invoice.booking
    @invoices = booking.invoices
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def export_single
    invoice = Invoice.find(params[:id])
    pathname = Rails.root.join('tmp', Time.now.to_s)
    FileUtils.mkdir_p("#{pathname}")
    invoice.export!(pathname)
    File.open("#{pathname}/Invoice #{invoice.number}.pdf", 'r') do |f|
      send_data f.read, filename: "Invoice #{invoice.number}.pdf"
    end
  end

  def export
    invoice_ids = perform_search(model: 'Invoice').pluck(:id)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export invoices", first_line: "Exporting Invoices", second_line: true, current_value: 0, total_value: invoice_ids.length)
    ExportInvoices.perform_async(invoice_ids, time_started)
    render json: { job: job.render_json }
  end

  private

  def get_total(params, booking, calculations)
    total = 0
    total += params[:rows].reduce(0) { |accum, row| accum + row[:amount].to_i } if params[:rows]
    total += booking.advance if params[:advance] == "true"
    total += calculations[:overage] if params[:overage] == "true"
    total += booking.shipping_fee if params[:ship_fee] == "true"
    total
  end

end
