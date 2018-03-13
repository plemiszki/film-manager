class Api::FilmLanguagesController < ApplicationController

  def create
    @film_language = FilmLanguage.new(film_language_params)
    if @film_language.save
      @film_languages = FilmLanguage.where(film_id: @film_language.film_id).includes(:film)
      @languages = Language.where.not(id: @film_languages.pluck(:language_id))
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film_language = FilmLanguage.find(params[:id])
    @film_language.destroy
    @film_languages = FilmLanguage.where(film_id: @film_language.film_id).includes(:film)
    @languages = Language.where.not(id: @film_languages.pluck(:language_id))
    render 'index.json.jbuilder'
  end

  private

  def film_language_params
    params[:film_language].permit(:film_id, :language_id)
  end

end
