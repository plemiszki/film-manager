class Api::ReturnsController < ApplicationController

  def index
    @returns = Return.all.includes(:customer)
    @dvd_customers = DvdCustomer.all
    render "index.json.jbuilder"
  end

  def show
    @returns = Return.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @return = Return.new(return_params)
    if @return.save
      @returns = Return.all.includes(:customer)
      @dvd_customers = DvdCustomer.all
      render "index.json.jbuilder"
    else
      render json: @return.errors.full_messages, status: 422
    end
  end

  # def update
  #   @purchase_order = PurchaseOrder.find(params[:id])
  #   if @purchase_order.update(purchase_order_params)
  #     @purchase_orders = PurchaseOrder.where(id: params[:id])
  #     @shipping_addresses = ShippingAddress.all
  #     get_data_for_items
  #     render "show.json.jbuilder"
  #   else
  #     render json: @purchase_order.errors.full_messages, status: 422
  #   end
  # end
  #
  # def destroy
  #   @purchase_order = PurchaseOrder.find(params[:id])
  #   if @purchase_order.destroy
  #     render json: @purchase_order, status: 200
  #   else
  #     render json: @purchase_order.errors.full_messages, status: 422
  #   end
  # end

  private

  def return_params
    params[:return].permit(:date, :number, :customer_id)
  end

end
