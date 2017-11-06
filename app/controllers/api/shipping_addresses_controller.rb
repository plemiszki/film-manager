class Api::ShippingAddressesController < ApplicationController

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

  private

  def shipping_address_params
    params[:shipping_address].permit(:label, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id)
  end

end
