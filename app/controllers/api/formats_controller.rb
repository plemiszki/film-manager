class Api::FormatsController < AdminController

  def index
    @formats = Format.all
    render "index.json.jbuilder"
  end

  def show
    @format = Format.find(params[:id])
    render "show.json.jbuilder"
  end

  def create
    @format = Format.new(format_params)
    if @format.save
      @formats = Format.all
      render "index.json.jbuilder"
    else
      render json: @format.errors.full_messages, status: 422
    end
  end

  def update
    @format = Format.find(params[:id])
    if @format.update(format_params)
      render "show.json.jbuilder"
    else
      render json: @format.errors.full_messages, status: 422
    end
  end

  def destroy
    @format = Format.find(params[:id])
    if @format.destroy
      render json: @format, status: 200
    else
      render json: @format.errors.full_messages, status: 422
    end
  end

  private

  def format_params
    params[:format].permit(:name, :active)
  end

end
