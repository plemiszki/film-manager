class Api::DigitalRetailersController < AdminController

  def index
    @digital_retailers = DigitalRetailer.all
    render 'index.json.jbuilder'
  end

  def show
    @digital_retailer = DigitalRetailer.find(params[:id])
    render 'show.json.jbuilder'
  end

  def create
    @digital_retailer = DigitalRetailer.new(digital_retailer_params)
    if @digital_retailer.save
      @digital_retailers = DigitalRetailer.all
      render 'index.json.jbuilder'
    else
      render json: @digital_retailer.errors.full_messages, status: 422
    end
  end

  def update
    @digital_retailer = DigitalRetailer.find(params[:id])
    if @digital_retailer.update(digital_retailer_params)
      render 'show.json.jbuilder'
    else
      render json: @digital_retailer.errors.full_messages, status: 422
    end
  end

  def destroy
    @digital_retailer = DigitalRetailer.find(params[:id])
    if @digital_retailer.destroy
      render json: @digital_retailer, status: 200
    else
      render json: @digital_retailer.errors.full_messages, status: 422
    end
  end

  private

  def digital_retailer_params
    params[:digital_retailer].permit(:name, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :sage_id)
  end

end
