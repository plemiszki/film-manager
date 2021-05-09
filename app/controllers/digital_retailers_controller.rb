class DigitalRetailersController < AdminController

  def show
    @digital_retailer = DigitalRetailer.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
