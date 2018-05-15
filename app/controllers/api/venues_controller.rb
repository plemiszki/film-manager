class Api::VenuesController < AdminController

  def index
    @venues = Venue.all
    render "index.json.jbuilder"
  end

  def show
    @venues = Venue.where(id: params[:id])
    @bookings = Booking.where(venue_id: @venues.first.id).includes(:film)
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
      render "show.json.jbuilder"
    else
      render json: @venue.errors.full_messages, status: 422
    end
  end

  def destroy
    @venue = Venue.find(params[:id])
    if @venue.destroy
      render json: @venue, status: 200
    else
      render json: @venue.errors.full_messages, status: 422
    end
  end

  private

  def venue_params
    params[:venue].permit(:label, :sage_id, :venue_type, :email, :phone, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :notes, :contact_name)
  end

end
