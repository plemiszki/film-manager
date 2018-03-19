class ShippingAddressesController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @shipping_address = ShippingAddress.find_by(id: params[:id])
    render "show.html.erb"
  end

end
