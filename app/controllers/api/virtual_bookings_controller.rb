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

  def show
    @virtual_booking = VirtualBooking.find(params[:id])
    @films = Film.all
    @venues = Venue.all
    render "show.json.jbuilder"
  end

  def update
    @virtual_booking = VirtualBooking.find(params[:id])
    if @virtual_booking.update(virtual_booking_params)
      render "show.json.jbuilder"
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

  private

  def virtual_booking_params
    params[:virtual_booking].permit(:film_id, :venue_id, :date_added, :start_date, :end_date, :shipping_city, :shipping_state, :terms, :url)
  end

end
