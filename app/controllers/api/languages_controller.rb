class Api::LanguagesController < AdminController

  def index
    @languages = Language.all
    render "index.json.jbuilder"
  end

  def show
    @languages = Language.where(id: params[:id])
    render "index.json.jbuilder"
  end

  def create
    @language = Language.new(language_params)
    if @language.save
      @languages = Language.all
      render "index.json.jbuilder"
    else
      render json: @language.errors.full_messages, status: 422
    end
  end

  def update
    @language = Language.find(params[:id])
    if @language.update(language_params)
      @languages = Language.all
      render "index.json.jbuilder"
    else
      render json: @language.errors.full_messages, status: 422
    end
  end

  def destroy
    @language = Language.find(params[:id])
    if @language.destroy
      render json: @language, status: 200
    else
      render json: @language.errors.full_messages, status: 422
    end
  end

  private

  def language_params
    params[:language].permit(:name)
  end

end
