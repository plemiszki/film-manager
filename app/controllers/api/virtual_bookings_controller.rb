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
    if params[:search_criteria] && params[:search_criteria][:has_url]
      if params[:search_criteria][:has_url][:value] == 'f'
        params[:search_criteria][:has_url][:value] = ''
      else
        params[:search_criteria][:has_url].delete(:value)
        params[:search_criteria][:has_url][:not] = ''
      end
    end
    @virtual_bookings = perform_search(
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
      @virtual_booking.save!
      @virtual_bookings = VirtualBooking.all.includes(:film, :venue).order('start_date DESC')
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @virtual_booking.errors.full_messages, status: 422
    end
  end

  def show
    @virtual_booking = VirtualBooking.find(params[:id])
    @calculations = booking_calculations(@virtual_booking)
    @films = Film.all
    @venues = Venue.all
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def update
    @virtual_booking = VirtualBooking.find(params[:id])
    if @virtual_booking.update(virtual_booking_params)
      @calculations = booking_calculations(@virtual_booking)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @virtual_booking.errors.full_messages, status: 422
    end
  end

  def destroy
    @virtual_booking = VirtualBooking.find(params[:id])
    if @virtual_booking.destroy
      render json: @virtual_booking, status: 200
    else
      render json: @virtual_booking.errors.full_messages, status: 422
    end
  end

  def send_report
    virtual_booking = VirtualBooking.find(params[:id])
    deduction = virtual_booking.deduction
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "send virtual booking report", first_line: "Sending Report")
    SendVirtualBookingReport.perform_async(0,
      virtual_booking_id: virtual_booking.id,
      time_started: time_started,
      current_user_id: current_user.id
    )
    render json: { job: job.render_json }
  end

  private

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
