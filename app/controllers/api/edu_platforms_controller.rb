class Api::EduPlatformsController < AdminController

  def index
    @edu_platforms = EduPlatform.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @edu_platform = EduPlatform.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @edu_platform = EduPlatform.new(edu_platform_params)
    if @edu_platform.save
      @edu_platforms = EduPlatform.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@edu_platform)
    end
  end

  def update
    @edu_platform = EduPlatform.find(params[:id])
    if @edu_platform.update(edu_platform_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@edu_platform)
    end
  end

  def destroy
    @edu_platform = EduPlatform.find(params[:id])
    if @edu_platform.destroy
      render json: @edu_platform, status: 200
    else
      render_errors(@edu_platform)
    end
  end

  private

  def edu_platform_params
    params[:edu_platform].permit(:name)
  end

end
