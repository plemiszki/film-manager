class Api::LanguagesController < AdminController

  def index
    @languages = Language.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @language = Language.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @language = Language.new(language_params)
    if @language.save
      @languages = Language.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@language)
    end
  end

  def update
    @language = Language.find(params[:id])
    if @language.update(language_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@language)
    end
  end

  def destroy
    @language = Language.find(params[:id])
    if @language.destroy
      render json: @language, status: 200
    else
      render_errors(@language)
    end
  end

  private

  def language_params
    params[:language].permit(:name)
  end

end
