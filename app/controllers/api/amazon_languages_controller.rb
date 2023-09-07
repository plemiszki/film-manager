class Api::AmazonLanguagesController < AdminController

  def index
    @amazon_languages = AmazonLanguage.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @amazon_language = AmazonLanguage.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    amazon_language = AmazonLanguage.new(amazon_language_params)
    if amazon_language.save
      @amazon_languages = AmazonLanguage.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(amazon_language)
    end
  end

  def update
    @amazon_language = AmazonLanguage.find(params[:id])
    if @amazon_language.update(amazon_language_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@alias)
    end
  end

  def destroy
    @amazon_language = AmazonLanguage.find(params[:id])
    @amazon_language.destroy
    render json: @amazon_language, status: 200
  end

  private

  def amazon_language_params
    params[:amazon_language].permit(:name)
  end

end
