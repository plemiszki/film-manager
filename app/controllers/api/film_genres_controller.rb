class Api::FilmGenresController < AdminController

  include Reorderable

  def create
    current_length = FilmGenre.where(film_id: film_genre_params[:film_id]).length
    @film_genre = FilmGenre.new(film_genre_params.merge({ order: current_length }))
    if @film_genre.save
      @film_genres = FilmGenre.where(film_id: @film_genre.film_id).includes(:film)
      @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @film_genre = FilmGenre.find(params[:id])
    @film_genre.destroy
    reorder(FilmGenre.where(film_id: @film_genre.film_id).order(:order))
    @film_genres = FilmGenre.where(film_id: @film_genre.film_id).includes(:film)
    @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def rearrange
    params[:new_order].each do |index, id|
      filmGenre = FilmGenre.find(id)
      filmGenre.update(order: index)
    end
    @film_genres = FilmGenre.where(film_id: params[:film_id]).includes(:film)
    @genres = Genre.where.not(id: @film_genres.pluck(:genre_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def film_genre_params
    params[:film_genre].permit(:film_id, :genre_id)
  end

end
