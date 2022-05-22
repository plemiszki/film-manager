class Api::DigitalRetailersController < AdminController

  def index
    @digital_retailers = DigitalRetailer.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @digital_retailer = DigitalRetailer.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @digital_retailer = DigitalRetailer.new(digital_retailer_params)
    if @digital_retailer.save
      @digital_retailers = DigitalRetailer.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@digital_retailer)
    end
  end

  def update
    @digital_retailer = DigitalRetailer.find(params[:id])
    if @digital_retailer.update(digital_retailer_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@digital_retailer)
    end
  end

  def destroy
    @digital_retailer = DigitalRetailer.find(params[:id])
    if @digital_retailer.destroy
      render json: @digital_retailer, status: 200
    else
      render_errors(@digital_retailer)
    end
  end

  private

  def digital_retailer_params
    params[:digital_retailer].permit(:name, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :sage_id)
  end

end
