class Api::AliasesController < AdminController

  def index
    @aliases = Alias.all.includes(:film)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def new
    @films = Film.all
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @alias = Alias.find(params[:id])
    @films = Film.all
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @alias = Alias.new(alias_params)
    if @alias.save
      @aliases = Alias.all.includes(:film)
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @alias.errors.full_messages, status: 422
    end
  end

  def update
    @alias = Alias.find(params[:id])
    if @alias.update(alias_params)
      @films = Film.all
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @alias.errors.full_messages, status: 422
    end
  end

  def destroy
    @alias = Alias.find(params[:id])
    @alias.destroy
    render json: @alias, status: 200
  end

  private

  def alias_params
    params[:alias].permit(:text, :film_id)
  end

end
