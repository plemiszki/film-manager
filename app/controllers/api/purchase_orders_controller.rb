class Api::PurchaseOrdersController < ApplicationController

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer)
    render "index.json.jbuilder"
  end

  def show
    @purchase_orders = PurchaseOrder.where(id: params[:id])
    @dvds = @purchase_orders[0].dvds.includes(:feature)
    @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
    render "show.json.jbuilder"
  end

  def create
    @purchase_order = PurchaseOrder.new(purchase_order_params)
    if @purchase_order.save
      render "create.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def update
    @giftbox = PurchaseOrder.find(params[:id])
    if @giftbox.update(giftbox_params)
      @purchase_orders = PurchaseOrder.where(id: params[:id])
      @dvds = @purchase_orders[0].dvds
      @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
      render "show.json.jbuilder"
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  def destroy
    @giftbox = PurchaseOrder.find(params[:id])
    if @giftbox.destroy
      render json: @giftbox, status: 200
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  private

  def purchase_order_params
    params[:purchase_order].permit(:number, :order_date)
  end

end