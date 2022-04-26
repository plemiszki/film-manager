class Api::BookersController < AdminController

  def index
    @bookers = Booker.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @booker = Booker.find(params[:id])
    @booker_venues = BookerVenue.where(booker_id: params[:id])
    @venues = Venue.where.not(id: @booker_venues.pluck(:venue_id))
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @booker = Booker.new(booker_params)
    if @booker.save
      @bookers = Booker.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@booker)
    end
  end

  def update
    @booker = Booker.find(params[:id])
    if @booker.update(booker_params)
      @booker_venues = BookerVenue.where(booker_id: params[:id])
      @venues = Venue.where.not(id: @booker_venues.pluck(:venue_id))
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@booker)
    end
  end

  def destroy
    @booker = Booker.find(params[:id])
    if @booker.destroy
      render json: @booker, status: 200
    else
      render_errors(@booker)
    end
  end

  private

  def booker_params
    params[:booker].permit(:name, :email, :phone)
  end

end
