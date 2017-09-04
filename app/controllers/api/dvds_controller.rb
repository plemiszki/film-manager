class Api::DvdsController < ApplicationController

  def show
    @dvds = Dvd.where(id: params[:id])
    @dvd_types = DvdType.all
    render "show.json.jbuilder"
  end

  def create
    @dvd = Dvd.new(name: dvd_params[:name], discount: dvd_params[:discount])
    if @dvd.save
      @dvds = Dvd.all
      render "index.json.jbuilder"
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  def update
    @dvd = Dvd.find(params[:id])
    if @dvd.update(dvd_params)
      @dvds = Dvd.where(id: params[:id])
      @dvd_types = DvdType.all
      render "show.json.jbuilder"
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  def destroy
    @dvd = Dvd.find(params[:id])
    if @dvd.destroy
      render json: @dvd, status: 200
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  private

  def dvd_params
    params[:dvd].permit(:name, :upc, :price, :dvd_type_id, :feature_film_id, :stock, :repressing, :sound_config, :special_features, :discs, :units_shipped, :first_shipment)
  end

end
