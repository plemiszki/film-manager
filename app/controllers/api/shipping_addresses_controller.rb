class Api::ShippingAddressesController < AdminController

  def index
    @shipping_addresses = ShippingAddress.all
    render "index.json.jbuilder"
  end

  def create
    @shipping_address = ShippingAddress.new(shipping_address_params)
    if @shipping_address.save
      @shipping_addresses = ShippingAddress.all
      render "create.json.jbuilder"
    else
      render json: @shipping_address.errors.full_messages, status: 422
    end
  end

  def show
    @shipping_address = ShippingAddress.find(params[:id])
    @dvd_customers = DvdCustomer.all
    render "show.json.jbuilder"
  end

  def update
    @shipping_address = ShippingAddress.find(params[:id])
    if @shipping_address.update(shipping_address_params)
      @shipping_addresses = ShippingAddress.where(id: params[:id])
      @dvd_customers = DvdCustomer.all
      render "show.json.jbuilder"
    else
      render json: @shipping_address.errors.full_messages, status: 422
    end
  end

  def destroy
    @shipping_address = ShippingAddress.find(params[:id])
    if @shipping_address.destroy
      render json: @shipping_address, status: 200
    else
      render json: @shipping_address.errors.full_messages, status: 422
    end
  end

  private

  def shipping_address_params
    params[:shipping_address].permit(:label, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id)
  end

end
