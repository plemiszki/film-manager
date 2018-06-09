class Api::DvdShortsController < AdminController

  def create
    @dvd_short = DvdShort.new(dvd_short_params)
    if @dvd_short.save
      @dvds = Dvd.where(id: dvd_short_params[:dvd_id])
      @dvd_types = DvdType.all
      @shorts = @dvds[0].shorts
      @other_shorts = Film.where(film_type: 'Short') - @shorts
      render "show.json.jbuilder"
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  def destroy
    @dvd_short = DvdShort.where(dvd_id: dvd_short_params[:dvd_id], short_id: dvd_short_params[:short_id])[0]
    if @dvd_short.destroy
      @dvds = Dvd.where(id: dvd_short_params[:dvd_id])
      @dvd_types = DvdType.all
      @shorts = @dvds[0].shorts
      @other_shorts = Film.where(film_type: 'Short') - @shorts
      render "show.json.jbuilder"
    else
      render json: @dvd.errors.full_messages, status: 422
    end
  end

  private

  def dvd_short_params
    params[:dvd_short].permit(:dvd_id, :short_id)
  end

end
