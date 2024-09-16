class Api::VenuesController < AdminController

  include BookingCalculations
  include SearchIndex

  def index
    @venues = perform_search(model: 'Venue')
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @venue = Venue.new(venue_params)
    if @venue.save
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@venue)
    end
  end

  def show
    @venue = Venue.find(params[:id])
    @bookings = Booking.where(venue_id: @venue.id).includes(:film)
    @calculations = {}
    @bookings.each do |booking|
      @calculations[booking.id] = booking_calculations(booking)
    end
    render 'show', formats: [:json], handlers: [:jbuilder]
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
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@venue)
    end
  end

  def destroy
    @venue = Venue.find(params[:id])
    if @venue.bookings.present? || @venue.virtual_bookings.present?
      render json: { message: 'This venue cannot be deleted because there are bookings associated with it.', memo: 'To delete this venue, please first delete the associated bookings.' }, status: 422
    else
      @venue.destroy
      render json: @venue, status: 200
    end
  end

  def create_in_stripe
    @venue = Venue.find(params[:id])
    @venue.create_stripe_customer!
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  private

  def venue_params
    params[:venue].permit(:label, :sage_id, :venue_type, :email, :phone, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :notes, :contact_name, :website)
  end

end
