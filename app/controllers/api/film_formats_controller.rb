class Api::FilmFormatsController < AdminController

  def create
    @film_format = FilmFormat.new(film_format_params)
    if @film_format.save
      @film_formats = FilmFormat.where(film_id: @film_format.film_id).includes(:film)
      @formats = Format.where.not(id: @film_formats.pluck(:format_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @film_format = FilmFormat.find(params[:id])
    @film_format.destroy
    @film_formats = FilmFormat.where(film_id: @film_format.film_id).includes(:film)
    @formats = Format.where.not(id: @film_formats.pluck(:format_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def film_format_params
    params[:film_format].permit(:film_id, :format_id)
  end

end
