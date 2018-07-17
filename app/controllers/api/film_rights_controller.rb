class Api::FilmRightsController < AdminController

  def show
    @film_rights = FilmRight.where(id: params[:id]).includes(:film)
    @territories = Territory.all
    @rights = Right.all
    render 'show.json.jbuilder'
  end

  def create
    error = false
    params[:rights].each do |right_id|
      params[:territories].each do |territory_id|
        @film_right = FilmRight.find_by({ film_id: params[:film_right][:film_id], right_id: right_id, territory_id: territory_id })
        if @film_right
          if @film_right.update({ start_date: params[:film_right][:start_date], end_date: params[:film_right][:end_date], exclusive: params[:film_right][:exclusive] })
          else
            error = true
            break
          end
        else
          @film_right = FilmRight.new({ film_id: params[:film_right][:film_id], right_id: right_id, territory_id: territory_id, start_date: params[:film_right][:start_date], end_date: params[:film_right][:end_date], exclusive: params[:film_right][:exclusive] })
          if @film_right.save
          else
            error = true
            break
          end
        end
      end
    end
    if error
      render json: @film_right.errors.full_messages, status: 422
    else
      render json: @film_right
    end
  end

  def update
    @film_right = FilmRight.find(params[:id])
    if @film_right.update(film_right_params)
      @film_rights = FilmRight.where(id: params[:id]).includes(:film)
      @territories = Territory.all
      @rights = Right.all
      render 'show.json.jbuilder'
    else
      render json: @film_right.errors.full_messages, status: 422
    end
  end

  def destroy
    @film_right = FilmRight.find(params[:id])
    if @film_right.destroy
      render json: @film_right, status: 200
    else
      render json: @film_right.errors.full_messages, status: 422
    end
  end

  def rights_and_territories
    @rights = Right.all
    @territories = Territory.all
    @films = Film.all if params[:films_too]
    render 'new.json.jbuilder'
  end

  private

  def film_right_params
    params[:film_right].permit(:film_id, :right_id, :territory_id, :start_date, :end_date, :exclusive)
  end

end
