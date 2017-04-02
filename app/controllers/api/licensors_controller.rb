class Api::LicensorsController < ApplicationController

  def index
    @licensors = Licensor.all
    render "index.json.jbuilder"
  end

  def show
    @licensors = Licensor.where(id: params[:id])
    @films = Film.where(licensor_id: params[:id]).order(:title)
    render "show.json.jbuilder"
  end

  def create
    @licensor = Licensor.new(name: licensor_params[:name], email: "", address: "")
    if @licensor.save
      @licensors = Licensor.all
      render "index.json.jbuilder"
    else
      render json: @licensor.errors.full_messages, status: 422
    end
  end

  def update
    @licensor = Licensor.find(params[:id])
    @films = Film.where(licensor_id: params[:id]).order(:title)
    if @licensor.update(licensor_params)
      @licensors = Licensor.where(id: params[:id])
      render "show.json.jbuilder"
    else
      render json: @licensor.errors.full_messages, status: 422
    end
  end

  def destroy
    @licensor = Licensor.find(params[:id])
    if @licensor.destroy
      render json: @licensor, status: 200
    else
      render json: @licensor.errors.full_messages, status: 422
    end
  end

  private

  def licensor_params
    params[:licensor].permit(:name, :email, :address)
  end

end
