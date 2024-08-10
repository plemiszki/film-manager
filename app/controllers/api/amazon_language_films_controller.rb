class Api::AmazonLanguageFilmsController < AdminController

  def create
    amazon_language_film = AmazonLanguageFilm.new(amazon_language_film_params)
    if amazon_language_film.save
      generate_response(amazon_language_film.film_id)
    end
  end

  def destroy
    amazon_language_film = AmazonLanguageFilm.find(params[:id])
    amazon_language_film.destroy
    generate_response(amazon_language_film.film_id)
  end

  private

  def generate_response(film_id)
    @amazon_language_films = AmazonLanguageFilm.where(film_id: film_id).includes(:amazon_language)
    @amazon_languages = AmazonLanguage.where.not(id: @amazon_language_films.pluck(:amazon_language_id))
    @film = Film.find(film_id)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def amazon_language_film_params
    params[:amazon_language_film].permit(:film_id, :amazon_language_id)
  end

end
