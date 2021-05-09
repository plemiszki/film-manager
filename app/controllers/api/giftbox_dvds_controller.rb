class Api::GiftboxDvdsController < AdminController

  def create
    @giftbox_dvd = GiftboxDvd.new(giftbox_dvd_params)
    if @giftbox_dvd.save
      @giftboxes = Giftbox.where(id: giftbox_dvd_params[:giftbox_id])
      @dvds = @giftboxes[0].dvds
      @other_dvds = Dvd.includes(:feature, :dvd_type) - @dvds
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @giftbox_dvd.errors.full_messages, status: 422
    end
  end

  def destroy
    @giftbox_dvd = GiftboxDvd.where(giftbox_id: giftbox_dvd_params[:giftbox_id], dvd_id: giftbox_dvd_params[:dvd_id])[0]
    if @giftbox_dvd.destroy
      @giftboxes = Giftbox.where(id: giftbox_dvd_params[:giftbox_id])
      @dvds = @giftboxes[0].dvds.includes(:feature)
      @other_dvds = Dvd.all.includes(:feature, :dvd_type) - @dvds
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @giftbox_dvd.errors.full_messages, status: 422
    end
  end

  private

  def giftbox_dvd_params
    params[:giftbox_dvd].permit(:giftbox_id, :dvd_id)
  end

end
