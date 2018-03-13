class Api::FilmGenresController < ApplicationController

  def create
    @film_genre = FilmGenre.new(film_genre_params)
    if @film_genre.save
      @film_genres = FilmGenre.where(film_id: @film_genre.film_id).includes(:film)
      @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film_genre = FilmGenre.find(params[:id])
    @film_genre.destroy
    @film_genres = FilmGenre.where(film_id: @film_genre.film_id).includes(:film)
    @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
    render 'index.json.jbuilder'
  end

  private

  def film_genre_params
    params[:film_genre].permit(:film_id, :genre_id)
  end

end
