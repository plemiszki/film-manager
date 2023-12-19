class Api::VirtualBookingsController < AdminController

  include SearchIndex
  include BookingCalculations

  INVOICE_OR_REPORT_SENT_SUBQUERY = <<-SQL
    select virtual_bookings.id as vb_id, count(invoices.id) as invoice_count
    from virtual_bookings
    join invoices on virtual_bookings.id = invoices.booking_id
    where invoices.booking_type = 'VirtualBooking'
    group by virtual_bookings.id
    having count(invoices.id) > 0
  SQL

  def index
    @virtual_bookings = virtual_bookings_search
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def new
    @films = Film.all.order(:title)
    @venues = Venue.all.order(:label)
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @virtual_booking = VirtualBooking.new(virtual_booking_params)
    if @virtual_booking.save
      venue = Venue.find(@virtual_booking.venue_id)
      @virtual_booking.shipping_city = venue.shipping_city
      @virtual_booking.shipping_state = venue.shipping_state
      @virtual_booking.email = venue.email
      @virtual_booking.billing_name = venue.billing_name
      @virtual_booking.billing_address1 = venue.billing_address1
      @virtual_booking.billing_address2 = venue.billing_address2
      @virtual_booking.billing_city = venue.billing_city
      @virtual_booking.billing_state = venue.billing_state
      @virtual_booking.billing_zip = venue.billing_zip
      @virtual_booking.billing_country = venue.billing_country
      @virtual_booking.save!
      @virtual_bookings = VirtualBooking.all.includes(:film, :venue).order('start_date DESC')
      render 'create', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@virtual_booking)
    end
  end

  def show
    @virtual_booking = VirtualBooking.find(params[:id])
    @calculations = booking_calculations(@virtual_booking)
    @films = Film.all
    @venues = Venue.all
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def invoices
    @invoices = VirtualBooking.find(params[:id]).invoices.includes(:invoice_rows)
    render 'invoices', formats: [:json], handlers: [:jbuilder]
  end

  def update
    @virtual_booking = VirtualBooking.find(params[:id])
    if @virtual_booking.update(virtual_booking_params)
      @calculations = booking_calculations(@virtual_booking)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@virtual_booking)
    end
  end

  def destroy
    @virtual_booking = VirtualBooking.find(params[:id])
    if @virtual_booking.destroy
      render json: @virtual_booking, status: 200
    else
      render_errors(@virtual_booking)
    end
  end

  def send_report
    virtual_booking = VirtualBooking.find(params[:id])
    deduction = virtual_booking.deduction
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "send virtual booking report", first_line: "Sending Report")
    SendVirtualBookingReport.perform_async(0, {
      virtual_booking_id: virtual_booking.id,
      time_started: time_started,
      current_user_id: current_user.id,
    }.stringify_keys)
    render json: { job: job.render_json }
  end

  def export
    virtual_booking_ids = virtual_bookings_search.to_a.pluck(:id)
    time_started = Time.now.to_s
    job = Job.create!(
      job_id: time_started,
      name: "export virtual bookings",
      first_line: "Exporting Virtual Bookings",
      second_line: true,
      current_value: 0,
      total_value: virtual_booking_ids.length
    )
    ExportVirtualBookings.perform_async(virtual_booking_ids, time_started)
    render json: { job: job.render_json }
  end

  private

  def virtual_bookings_search
    if params[:search_criteria] && params[:search_criteria][:has_url]
      if params[:search_criteria][:has_url][:value] == 'f'
        params[:search_criteria][:has_url][:value] = ''
      else
        params[:search_criteria][:has_url].delete(:value)
        params[:search_criteria][:has_url][:not] = ''
      end
    end
    perform_search(
      model: 'VirtualBooking',
      associations: ['film', 'venue', 'invoices'],
      custom_queries: {
        invoice_or_report_sent: {
          true: {
            joins: [
              "left join(#{INVOICE_OR_REPORT_SENT_SUBQUERY}) as invoices_sent on virtual_bookings.id = invoices_sent.vb_id",
            ],
            where: '(host = 1 and invoice_count > 0) or (host = 0 and report_sent_date is not null)'
          },
          f: {
            joins: [
              "left join(#{INVOICE_OR_REPORT_SENT_SUBQUERY}) as invoices_sent on virtual_bookings.id = invoices_sent.vb_id",
            ],
            where: '(host = 1 and invoice_count = 0) or (host = 0 and report_sent_date is null)'
          }
        }
      }
    )
  end

  def virtual_booking_params
    params[:virtual_booking].permit(
      :film_id,
      :venue_id,
      :date_added,
      :start_date,
      :end_date,
      :shipping_city,
      :shipping_state,
      :terms,
      :url,
      :host,
      :deduction,
      :box_office,
      :box_office_received,
      :email,
      :billing_name,
      :billing_address1,
      :billing_address2,
      :billing_city,
      :billing_state,
      :billing_zip,
      :billing_country
    )
  end

end
