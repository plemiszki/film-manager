class DigitalRetailersController < AdminController

  def show
    @digital_retailer = DigitalRetailer.find_by(id: params[:id])
    render 'show.html.erb'
  end

end
