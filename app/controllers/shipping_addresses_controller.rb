class ShippingAddressesController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @shipping_address = ShippingAddress.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
