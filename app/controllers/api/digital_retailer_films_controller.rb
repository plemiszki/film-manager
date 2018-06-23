class Api::DigitalRetailerFilmsController < AdminController

  def create
    @digital_retailer_film = DigitalRetailerFilm.new(digital_retailer_film_params)
    if @digital_retailer_film.save
      @digital_retailer_films = DigitalRetailerFilm.where(film_id: @digital_retailer_film.film_id).includes(:digital_retailer)
      @digital_retailers = DigitalRetailer.where.not(id: @digital_retailer_films.pluck(:digital_retailer_id))
      render 'index.json.jbuilder'
    else
      render json: @digital_retailer_film.errors.full_messages, status: 422
    end
  end

  def destroy
    # @film_country = FilmCountry.find(params[:id])
    # @film_country.destroy
    # @film_countries = FilmCountry.where(film_id: @film_country.film_id).includes(:film)
    # @countries = Country.where.not(id: @film_countries.pluck(:country_id))
    # render 'index.json.jbuilder'
  end

  private

  def digital_retailer_film_params
    params[:digital_retailer_film].permit(:film_id, :digital_retailer_id, :url)
  end

end
