class Api::BookerVenuesController < AdminController

  def create
    @booker_venue = BookerVenue.new(booker_venue_params)
    if @booker_venue.save
      @booker_venues = BookerVenue.where(booker_id: @booker_venue.booker_id).includes(:venue)
      @venues = Venue.where.not(id: @booker_venues.pluck(:venue_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @booker_venue = BookerVenue.find(params[:id])
    @booker_venue.destroy
    @booker_venues = BookerVenue.where(booker_id: @booker_venue.booker_id).includes(:venue)
    @venues = Venue.where.not(id: @booker_venues.pluck(:venue_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def booker_venue_params
    params[:booker_venue].permit(:booker_id, :venue_id)
  end

end
