class Api::VirtualBookingsController < AdminController

  def index
    @virtual_bookings = VirtualBooking.all.includes(:film, :venue).order('start_date DESC')
    render 'index.json.jbuilder'
  end

  def new
    @films = Film.all
    @venues = Venue.all
    render "new.json.jbuilder"
  end

  def create
    @virtual_booking = VirtualBooking.new(virtual_booking_params)
    if @virtual_booking.save
      venue = Venue.find(@virtual_booking.venue_id)
      @virtual_booking.shipping_city = venue.shipping_city
      @virtual_booking.shipping_state = venue.shipping_state
      @virtual_booking.save!
      @virtual_bookings = VirtualBooking.all.includes(:film, :venue).order('start_date DESC')
      render 'index.json.jbuilder'
    else
      render json: @virtual_booking.errors.full_messages, status: 422
    end
  end

  # def show
  #   @bookings = Booking.where(id: params[:id]).includes(:invoices)
  #   @invoices = @bookings.first.invoices.includes(:invoice_rows)
  #   @weekly_terms = WeeklyTerm.where(booking_id: params[:id])
  #   @weekly_box_offices = WeeklyBoxOffice.where(booking_id: params[:id])
  #   @payments = Payment.where(booking_id: params[:id])
  #   @films = Film.all
  #   @venues = Venue.all
  #   @users = User.all
  #   @formats = Format.all
  #   @calculations = booking_calculations(@bookings.first)
  #   render "show.json.jbuilder"
  # end

  # def update
  #   @booking = Booking.find(params[:id])
  #   if @booking.update(booking_params)
  #     @bookings = Booking.where(id: params[:id]).includes(:invoices)
  #     @invoices = @bookings.first.invoices
  #     @films = Film.all
  #     @venues = Venue.all
  #     @users = User.all
  #     @formats = Format.all
  #     @calculations = booking_calculations(@bookings.first)
  #     render "show.json.jbuilder"
  #   else
  #     render json: @booking.errors.full_messages, status: 422
  #   end
  # end
  #
  # def destroy
  #   @bookings = Booking.find(params[:id])
  #   if @bookings.destroy
  #     render json: @bookings, status: 200
  #   else
  #     render json: @bookings.errors.full_messages, status: 422
  #   end
  # end

  private

  def virtual_booking_params
    params[:virtual_booking].permit(:film_id, :venue_id, :date_added, :start_date, :end_date, :shipping_city, :shipping_state)
  end

end
