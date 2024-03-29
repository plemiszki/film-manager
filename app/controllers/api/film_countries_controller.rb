class Api::FilmCountriesController < AdminController

  include Reorderable

  def create
    current_length = FilmCountry.where(film_id: film_country_params[:film_id]).length
    @film_country = FilmCountry.new(film_country_params.merge({ order: current_length }))
    if @film_country.save
      @film_countries = FilmCountry.where(film_id: @film_country.film_id).includes(:film)
      @countries = Country.where.not(id: @film_countries.pluck(:country_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @film_country = FilmCountry.find(params[:id])
    @film_country.destroy
    reorder(FilmCountry.where(film_id: @film_country.film_id).order(:order))
    @film_countries = FilmCountry.where(film_id: @film_country.film_id).includes(:film)
    @countries = Country.where.not(id: @film_countries.pluck(:country_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def rearrange
    params[:new_order].each do |index, id|
      filmCountry = FilmCountry.find(id)
      filmCountry.update(order: index)
    end
    @film_countries = FilmCountry.where(film_id: params[:film_id]).includes(:film)
    @countries = Country.where.not(id: @film_countries.pluck(:country_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def film_country_params
    params[:film_country].permit(:film_id, :country_id)
  end

end
