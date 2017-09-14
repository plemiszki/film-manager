class Api::DvdsController < ApplicationController

  def show
    @dvds = Dvd.where(id: params[:id])
    @dvd_types = DvdType.all
    @shorts = @dvds[0].shorts
    @other_shorts = Film.where(short_film: true) - @shorts
    render "show.json.jbuilder"
  end

  def create
    @dvd = Dvd.new(dvd_params)
    if @dvd.save
      render json: @dvd
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  def update
    @dvd = Dvd.find(params[:id])
    if @dvd.update(dvd_params)
      @dvds = Dvd.where(id: params[:id])
      @dvd_types = DvdType.all
      @shorts = @dvds[0].shorts
      @other_shorts = Film.where(short_film: true) - @shorts
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
    params[:dvd].permit(:name, :upc, :price, :dvd_type_id, :feature_film_id, :stock, :repressing, :sound_config, :special_features, :discs, :units_shipped, :first_shipment, :pre_book_date, :retail_date)
    # result[:pre_book_date] = Date.strptime(result[:pre_book_date], "%m/%d/%Y")
    # result[:retail_date] = Date.strptime(result[:retail_date], "%m/%d/%Y")
    # result
  end

end
