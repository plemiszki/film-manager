class Api::PurchaseOrdersController < ApplicationController

  include PurchaseOrderItems

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer, :purchase_order_items)
    @shipping_addresses = ShippingAddress.all
    @jobs = Job.where(name: "import inventory").order(:id)
    render "index.json.jbuilder"
  end

  def show
    @purchase_orders = PurchaseOrder.where(id: params[:id])
    @shipping_addresses = ShippingAddress.all
    get_data_for_items
    render "show.json.jbuilder"
  end

  def create
    params = purchase_order_params
    if params[:shipping_address_id] && params[:shipping_address_id] != ''
      shipping_address = ShippingAddress.find(params[:shipping_address_id].to_i)
      params[:name] = shipping_address.name
      params[:address1] = shipping_address.address1
      params[:address2] = shipping_address.address2
      params[:city] = shipping_address.city
      params[:state] = shipping_address.state
      params[:zip] = shipping_address.zip
      params[:country] = shipping_address.country
      params[:customer_id] = shipping_address.customer_id
      if (params[:customer_id] > 0 && DvdCustomer.find(params[:customer_id]).consignment == false)
        params[:send_invoice] = true
      else
        params[:send_invoice] = false
      end
    else
      params[:send_invoice] = false
    end
    params.delete(:shipping_address_id)
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
      @shipping_addresses = ShippingAddress.all
      get_data_for_items
      render "show.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def destroy
    @purchase_order = PurchaseOrder.find(params[:id])
    if @purchase_order.destroy
      render json: @purchase_order, status: 200
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def ship
    SendDvdPoAndInvoice.perform_async(params[:purchase_order][:id], current_user.id)
    render json: { message: 'ok' }, status: 200
  end

  def reporting
    @sales = {}
    month_totals = Hash.new(0)
    @dvd_customers = DvdCustomer.all.order(:name)
    @dvd_customers.each_with_index do |dvd_customer, index|
      months = {}
      total = 0
      1.upto(12) do |month|
        sales = PurchaseOrder.where(customer_id: dvd_customer.id, month: month, year: params[:year]).includes(:invoice).map { |po| po.invoice }.reduce(0) { |total, invoice| total += (invoice ? invoice.total : 0) }
        total += sales
        month_totals[month] += sales
        months[month] = sales
      end
      months[:total] = total
      @sales[dvd_customer.id] = months
      @sales[:month_totals] = month_totals
      @sales[:year_total] = month_totals.values.reduce(:+)
    end
    render "reporting.json.jbuilder"
  end

  private

  def purchase_order_params
    params[:purchase_order].permit(:number, :order_date, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id, :shipping_address_id, :send_invoice, :notes, :month, :year)
  end

end
