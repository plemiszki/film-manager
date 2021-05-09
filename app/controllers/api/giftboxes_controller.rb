class Api::GiftboxesController < AdminController

  def index
    @giftboxes = Giftbox.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @giftboxes = Giftbox.where(id: params[:id])
    @dvds = @giftboxes[0].dvds.includes(:feature)
    @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @giftbox = Giftbox.new(name: giftbox_params[:name], upc: giftbox_params[:upc])
    if @giftbox.save
      @giftboxes = Giftbox.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  def update
    @giftbox = Giftbox.find(params[:id])
    if @giftbox.update(giftbox_params)
      @giftboxes = Giftbox.where(id: params[:id])
      @dvds = @giftboxes[0].dvds
      @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  def destroy
    @giftbox = Giftbox.find(params[:id])
    if @giftbox.destroy
      render json: @giftbox, status: 200
    else
      render json: @giftbox.errors.full_messages, status: 422
    end
  end

  private

  def giftbox_params
    params[:giftbox].permit(:name, :upc, :sage_id, :on_demand, :msrp)
  end

end
