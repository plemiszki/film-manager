class Api::GiftboxesController < ApplicationController

  def index
    @giftboxes = Giftbox.all
    render "index.json.jbuilder"
  end

  def show
    @giftboxes = Giftbox.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @giftbox = Giftbox.new(name: giftbox_params[:name], upc: giftbox_params[:upc])
    if @giftbox.save
      @giftboxes = Giftbox.all
      render "index.json.jbuilder"
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  def update
    @giftbox = Giftbox.find(params[:id])
    if @giftbox.update(giftbox_params)
      @giftboxes = Giftbox.where(id: params[:id])
      render "show.json.jbuilder"
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  def destroy
    @licensor = Licensor.find(params[:id])
    if @licensor.destroy
      Film.where(licensor_id: params[:id]).update_all(licensor_id: nil)
      render json: @licensor, status: 200
    else
      render json: @licensor.errors.full_messages, status: 422
    end
  end

  private

  def giftbox_params
    params[:giftbox].permit(:name, :upc, :sage_id, :on_demand, :msrp)
  end

end
