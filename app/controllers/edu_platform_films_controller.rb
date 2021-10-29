class EduPlatformFilmsController < AdminController

  def show
    @edu_platform_film = EduPlatformFilm.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
