class Api::FilmCountriesController < ApplicationController

  def create
    @film_country = FilmCountry.new(film_country_params)
    if @film_country.save
      @film_countries = FilmCountry.where(film_id: @film_country.film_id).includes(:film)
      @countries = Country.where.not(id: @film_countries.pluck(:country_id))
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film_country = FilmCountry.find(params[:id])
    @film_country.destroy
    @film_countries = FilmCountry.where(film_id: @film_country.film_id).includes(:film)
    @countries = Country.where.not(id: @film_countries.pluck(:country_id))
    render 'index.json.jbuilder'
  end

  private

  def film_country_params
    params[:film_country].permit(:film_id, :country_id)
  end

end
