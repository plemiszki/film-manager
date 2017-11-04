class Api::PurchaseOrdersController < ApplicationController

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer)
    @jobs = Job.where(name: "import inventory").order(:id)
    render "index.json.jbuilder"
  end

  def show
    @purchase_orders = PurchaseOrder.where(id: params[:id])
    @dvd_customers = DvdCustomer.all
    # @dvds = @purchase_orders[0].dvds.includes(:feature)
    # @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
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
    params[:purchase_order].permit(:number, :order_date, :address1, :address2, :city, :state, :zip, :country, :customer_id)
  end

end
