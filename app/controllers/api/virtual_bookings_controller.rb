class Api::VirtualBookingsController < AdminController

  include SearchIndex
  include BookingCalculations

  def index
    @virtual_bookings = perform_search(model: 'VirtualBooking', associations: ['film', 'venue'])
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
    params[:virtual_booking].permit(:film_id, :venue_id, :date_added, :start_date, :end_date, :shipping_city, :shipping_state, :terms, :url, :host, :deduction, :box_office, :box_office_received, :email)
  end

end
