class Api::GiftboxesController < AdminController

  def index
    @giftboxes = Giftbox.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @giftbox = Giftbox.find(params[:id])
    @giftbox_dvds = @giftbox.giftbox_dvds
    @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @giftbox.dvds
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @giftbox = Giftbox.new(name: giftbox_params[:name], upc: giftbox_params[:upc])
    if @giftbox.save
      @giftboxes = Giftbox.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@giftbox)
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
      render_errors(@giftbox)
    end
  end

  def destroy
    @giftbox = Giftbox.find(params[:id])
    if @giftbox.destroy
      render json: @giftbox, status: 200
    else
      render_errors(@giftbox)
    end
  end

  private

  def giftbox_params
    params[:giftbox].permit(:name, :upc, :sage_id, :on_demand, :msrp)
  end

end
