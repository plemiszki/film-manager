class EduPlatformsController < AdminController

  def show
    @edu_platform = EduPlatform.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
