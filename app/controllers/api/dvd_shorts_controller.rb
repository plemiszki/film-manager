class Api::DvdShortsController < AdminController

  def create
    dvd_short = DvdShort.new(dvd_short_params)
    if dvd_short.save
      dvd = Dvd.find(dvd_short_params[:dvd_id])
      @dvd_shorts = dvd.dvd_shorts.includes(:film)
      @other_shorts = Film.shorts - @dvd_shorts.map(&:film)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: dvd.errors.full_messages, status: 422
    end
  end

  def destroy
    dvd_short = DvdShort.find(params[:id])
    if dvd_short.destroy
      @dvd_shorts = dvd_short.dvd.dvd_shorts.includes(:film)
      @other_shorts = Film.shorts - @dvd_shorts.map(&:film)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: dvd_short.errors.full_messages, status: 422
    end
  end

  private

  def dvd_short_params
    params[:dvd_short].permit(:dvd_id, :short_id)
  end

end
