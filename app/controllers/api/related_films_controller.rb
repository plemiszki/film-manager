class Api::RelatedFilmsController < ApplicationController

  include Reorderable

  def create
    current_length = RelatedFilm.where(film_id: related_film_params[:film_id]).length
    @related_film = RelatedFilm.new(related_film_params.merge({ order: current_length }))
    if @related_film.save
      @related_films = RelatedFilm.where(film_id: @related_film.film_id).includes(:other_film)
      @other_films = Film.where.not(id: ([@related_film.film_id] + @related_films.pluck(:other_film_id)))
      render "index.json.jbuilder"
    else
      render json: @related_film.errors.full_messages, status: 422
    end
  end

  def destroy
    @related_film = RelatedFilm.find(params[:id])
    @related_film.destroy
    reorder(RelatedFilm.where(film_id: @related_film.film_id).order(:order))
    @related_films = RelatedFilm.where(film_id: @related_film.film_id).includes(:other_film)
    @other_films = Film.where.not(id: ([@related_film.film_id] + @related_films.pluck(:other_film_id)))
    render "index.json.jbuilder"
  end

  private

  def related_film_params
    params[:related_film].permit(:film_id, :other_film_id, :order)
  end

end
