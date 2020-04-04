class Api::VenuesController < AdminController

  include BookingCalculations

  def index
    @venues = Venue.all
    render "index.json.jbuilder"
  end

  def show
    @venue = Venue.find(params[:id])
    @bookings = Booking.where(venue_id: @venue.id).includes(:film)
    @calculations = {}
    @bookings.each do |booking|
      @calculations[booking.id] = booking_calculations(booking)
    end
    render "show.json.jbuilder"
  end

  def create
    @venue = Venue.new(venue_params)
    if @venue.save
      @venues = Venue.all
      render "index.json.jbuilder"
    else
      render json: @venue.errors.full_messages, status: 422
    end
  end

  def update
    @venue = Venue.find(params[:id])
    if @venue.update(venue_params)
      @venues = Venue.where(id: params[:id])
      @bookings = Booking.where(venue_id: @venues.first.id).includes(:film)
      @calculations = {}
      @bookings.each do |booking|
        @calculations[booking.id] = booking_calculations(booking)
      end
      render "show.json.jbuilder"
    else
      render json: @venue.errors.full_messages, status: 422
    end
  end

  def destroy
    @venue = Venue.find(params[:id])
    if @venue.bookings.present?
      render json: { message: 'This venue cannot be deleted because there are bookings associated with it.', memo: 'To delete this venue, please first delete the associated bookings.' }, status: 422
    else
      @venue.destroy
      render json: @venue, status: 200
    end
  end

  private

  def venue_params
    params[:venue].permit(:label, :sage_id, :venue_type, :email, :phone, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :notes, :contact_name, :website)
  end

end
