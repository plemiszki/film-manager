class Api::AmazonGenreFilmsController < AdminController

  def create
    amazon_genre_film = AmazonGenreFilm.new(amazon_genre_film_params)
    if amazon_genre_film.save
      generate_response(amazon_genre_film.film_id)
    end
  end

  def destroy
    amazon_genre_film = AmazonGenreFilm.find(params[:id])
    amazon_genre_film.destroy
    generate_response(amazon_genre_film.film_id)
  end

  private

  def generate_response(film_id)
    @amazon_genre_films = AmazonGenreFilm.where(film_id: film_id).includes(:amazon_genre)
    @amazon_genres = AmazonGenre.where.not(id: @amazon_genre_films.pluck(:amazon_genre_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def amazon_genre_film_params
    params[:amazon_genre_film].permit(:film_id, :amazon_genre_id)
  end

end
