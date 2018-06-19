class Api::DigitalRetailersController < AdminController

  def index
    @digital_retailers = DigitalRetailer.all
    render 'index.json.jbuilder'
  end

  def show
    @digital_retailers = DigitalRetailer.where(id: params[:id])
    render 'index.json.jbuilder'
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
      @digital_retailers = DigitalRetailer.all
      render 'index.json.jbuilder'
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
    params[:digital_retailer].permit(:name)
  end

end
