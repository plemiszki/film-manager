class Api::FilmLanguagesController < AdminController

  include Reorderable

  def create
    current_length = FilmLanguage.where(film_id: film_language_params[:film_id]).length
    @film_language = FilmLanguage.new(film_language_params.merge({ order: current_length }))
    if @film_language.save
      @film_languages = FilmLanguage.where(film_id: @film_language.film_id).includes(:film)
      @languages = Language.where.not(id: @film_languages.pluck(:language_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @film_language = FilmLanguage.find(params[:id])
    @film_language.destroy
    reorder(FilmLanguage.where(film_id: @film_language.film_id).order(:order))
    @film_languages = FilmLanguage.where(film_id: @film_language.film_id).includes(:film)
    @languages = Language.where.not(id: @film_languages.pluck(:language_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def rearrange
    params[:new_order].each do |index, id|
      filmLanguage = FilmLanguage.find(id)
      filmLanguage.update(order: index)
    end
    @film_languages = FilmLanguage.where(film_id: params[:film_id]).includes(:film)
    @languages = Language.where.not(id: @film_languages.pluck(:language_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def film_language_params
    params[:film_language].permit(:film_id, :language_id)
  end

end
