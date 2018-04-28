class Api::BookersController < AdminController

  def index
    @bookers = Booker.all
    render 'index.json.jbuilder'
  end

  def show
    @bookers = Booker.where(id: params[:id])
    @booker_venues = BookerVenue.where(booker_id: params[:id])
    @venues = Venue.where.not(id: @booker_venues.pluck(:venue_id))
    render 'show.json.jbuilder'
  end

  def create
    @booker = Booker.new(booker_params)
    if @booker.save
      @bookers = Booker.all
      render 'index.json.jbuilder'
    else
      render json: @booker.errors.full_messages, status: 422
    end
  end

  def update
    @booker = Booker.find(params[:id])
    if @booker.update(booker_params)
      @bookers = Booker.all
      render 'index.json.jbuilder'
    else
      render json: @booker.errors.full_messages, status: 422
    end
  end

  def destroy
    @booker = Booker.find(params[:id])
    if @booker.destroy
      render json: @booker, status: 200
    else
      render json: @booker.errors.full_messages, status: 422
    end
  end

  private

  def booker_params
    params[:booker].permit(:name, :email, :phone)
  end

end
