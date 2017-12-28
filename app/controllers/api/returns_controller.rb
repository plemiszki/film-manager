class Api::ReturnsController < ApplicationController

  def index
    @returns = Return.all.includes(:customer)
    render "index.json.jbuilder"
  end

  # def show
  #   @purchase_orders = PurchaseOrder.where(id: params[:id])
  #   @shipping_addresses = ShippingAddress.all
  #   get_data_for_items
  #   render "show.json.jbuilder"
  # end
  #
  # def create
  #   params = purchase_order_params
  #   if params[:shipping_address_id] && params[:shipping_address_id] != ''
  #     shipping_address = ShippingAddress.find(params[:shipping_address_id].to_i)
  #     params[:name] = shipping_address.name
  #     params[:address1] = shipping_address.address1
  #     params[:address2] = shipping_address.address2
  #     params[:city] = shipping_address.city
  #     params[:state] = shipping_address.state
  #     params[:zip] = shipping_address.zip
  #     params[:country] = shipping_address.country
  #     params[:customer_id] = shipping_address.customer_id
  #     if (params[:customer_id] > 0 && DvdCustomer.find(params[:customer_id]).consignment == false)
  #       params[:send_invoice] = true
  #     else
  #       params[:send_invoice] = false
  #     end
  #   else
  #     params[:send_invoice] = false
  #   end
  #   params.delete(:shipping_address_id)
  #   @purchase_order = PurchaseOrder.new(params)
  #   if @purchase_order.save
  #     render "create.json.jbuilder"
  #   else
  #     render json: @purchase_order.errors.full_messages, status: 422
  #   end
  # end
  #
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
