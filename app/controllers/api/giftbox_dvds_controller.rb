class Api::GiftboxDvdsController < AdminController

  def create
    giftbox_dvd = GiftboxDvd.create(giftbox_dvd_params)
    if giftbox_dvd.save
      giftbox = giftbox_dvd.giftbox
      @giftbox_dvds = giftbox.giftbox_dvds
      @other_dvds = Dvd.all.includes(:feature, :dvd_type) - giftbox.dvds
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @giftbox_dvd.errors.full_messages, status: 422
    end
  end

  def destroy
    giftbox_dvd = GiftboxDvd.find(params[:id])
    if giftbox_dvd.destroy
      giftbox = giftbox_dvd.giftbox
      @giftbox_dvds = giftbox.giftbox_dvds
      @other_dvds = Dvd.all.includes(:feature, :dvd_type) - giftbox.dvds
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
