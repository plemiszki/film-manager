class Api::FormatsController < AdminController

  def index
    @formats = Format.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @format = Format.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @format = Format.new(format_params)
    if @format.save
      @formats = Format.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@format)
    end
  end

  def update
    @format = Format.find(params[:id])
    if @format.update(format_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@format)
    end
  end

  def destroy
    @format = Format.find(params[:id])
    if @format.destroy
      render json: @format, status: 200
    else
      render_errors(@format)
    end
  end

  private

  def format_params
    params[:format].permit(:name, :active)
  end

end
