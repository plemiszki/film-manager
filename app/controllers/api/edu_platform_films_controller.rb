class Api::EduPlatformFilmsController < AdminController

  def new
    @edu_platforms = EduPlatform.select(:id, :name)
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @edu_platform_film = EduPlatformFilm.new(edu_platform_film_params)
    if @edu_platform_film.save
      @edu_platform_films = EduPlatformFilm.where(film_id: @edu_platform_film.film_id).includes(:edu_platform)
      @edu_platforms = EduPlatform.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@edu_platform_film)
    end
  end

  def show
    @edu_platform_film = EduPlatformFilm.find(params[:id])
    @edu_platforms = EduPlatform.select(:id, :name).order(:name)
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def update
    @edu_platform_film = EduPlatformFilm.find(params[:id])
    if @edu_platform_film.update(edu_platform_film_params)
      @edu_platforms = EduPlatform.select(:id, :name).order(:name)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@edu_platform_film)
    end
  end

  def destroy
    @edu_platform_film = EduPlatformFilm.find(params[:id])
    @edu_platform_film.destroy
    render json: @edu_platform_film, status: 200
  end

  private

  def edu_platform_film_params
    params[:edu_platform_film].permit(:film_id, :edu_platform_id, :url)
  end

end
