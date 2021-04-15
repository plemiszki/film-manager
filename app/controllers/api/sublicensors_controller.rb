class Api::SublicensorsController < AdminController

  def index
    @sublicensors = Sublicensor.all
    render "index.json.jbuilder"
  end

  def show
    @sublicensor = Sublicensor.find(params[:id])
    render "show.json.jbuilder"
  end

  def create
    @sublicensor = Sublicensor.new(sublicensor_params)
    if @sublicensor.save
      @sublicensors = Sublicensor.all
      render "index.json.jbuilder"
    else
      render json: @sublicensor.errors.full_messages, status: 422
    end
  end

  def update
    @sublicensor = Sublicensor.find(params[:id])
    if @sublicensor.update(sublicensor_params)
      render "show.json.jbuilder"
    else
      render json: @sublicensor.errors.full_messages, status: 422
    end
  end

  def destroy
    @sublicensor = Sublicensor.find(params[:id])
    if @sublicensor.destroy
      render json: @sublicensor, status: 200
    else
      render json: @sublicensor.errors.full_messages, status: 422
    end
  end

  private

  def sublicensor_params
    params[:sublicensor].permit(:name, :email, :phone, :contact_name, :w8)
  end

end
