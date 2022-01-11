class Api::DigitalRetailerFilmsController < AdminController

  def new
    @digital_retailers = DigitalRetailer.all.order(:name)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @digital_retailer_film = DigitalRetailerFilm.new(digital_retailer_film_params)
    if @digital_retailer_film.save
      @digital_retailer_films = DigitalRetailerFilm.where(film_id: @digital_retailer_film.film_id).includes(:digital_retailer)
      @digital_retailers = DigitalRetailer.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @digital_retailer_film.errors.full_messages, status: 422
    end
  end

  def show
    @digital_retailer_film = DigitalRetailerFilm.find(params[:id])
    @digital_retailers = DigitalRetailer.select(:id, :name).order(:name)
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def update
    @digital_retailer_film = DigitalRetailerFilm.find(params[:id])
    if @digital_retailer_film.update(digital_retailer_film_params)
      @digital_retailers = DigitalRetailer.select(:id, :name).order(:name)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @digital_retailer_film.errors.full_messages, status: 422
    end
  end

  def destroy
    @digital_retailer_film = DigitalRetailerFilm.find(params[:id])
    @digital_retailer_film.destroy
    render json: @digital_retailer_film, status: 200
  end

  private

  def digital_retailer_film_params
    params[:digital_retailer_film].permit(:film_id, :digital_retailer_id, :url)
  end

end
