class Api::PurchaseOrdersController < ApplicationController

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer)
    @shipping_addresses = ShippingAddress.all
    @jobs = Job.where(name: "import inventory").order(:id)
    render "index.json.jbuilder"
  end

  def show
    @purchase_orders = PurchaseOrder.where(id: params[:id])
    @dvd_customers = DvdCustomer.all
    @shipping_addresses = ShippingAddress.all
    render "show.json.jbuilder"
  end

  def create
    params = purchase_order_params
    if params[:shipping_address_id]
      shipping_address = ShippingAddress.find(params[:shipping_address_id].to_i)
      params[:name] = shipping_address.name
      params[:address1] = shipping_address.address1
      params[:address2] = shipping_address.address2
      params[:city] = shipping_address.city
      params[:state] = shipping_address.state
      params[:zip] = shipping_address.zip
      params[:country] = shipping_address.country
      params[:customer_id] = shipping_address.customer_id
      params.delete(:shipping_address_id)
    end
    @purchase_order = PurchaseOrder.new(params)
    if @purchase_order.save
      render "create.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def update
    @purchase_order = PurchaseOrder.find(params[:id])
    if @purchase_order.update(purchase_order_params)
      @purchase_orders = PurchaseOrder.where(id: params[:id])
      @dvd_customers = DvdCustomer.all
      render "show.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
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
    params[:purchase_order].permit(:number, :order_date, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id, :shipping_address_id)
  end

end
