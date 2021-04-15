class Api::SubRightsController < AdminController

  include SearchIndex

  def index
    @sub_rights = perform_search(model: 'SubRight', associations: ['film', 'territory', 'right'])
    render 'index.json.jbuilder'
  end

  def new
    @territories = Territory.all.order(:name)
    @rights = Right.all.order(:name)
    @films = Film.all.order(:title)
    render 'new.json.jbuilder'
  end

  def show
    @sub_rights = SubRight.where(id: params[:id])
    @territories = Territory.all
    @rights = Right.all
    @films = Film.all
    render 'show.json.jbuilder'
  end

  def create
    error = false
    params[:rights].each do |right_id|
      params[:territories].each do |territory_id|
        @sub_right = SubRight.find_by({ sublicensor_id: params[:sub_right][:sublicensor_id], right_id: right_id, territory_id: territory_id, film_id: params[:sub_right][:film_id], exclusive: params[:sub_right][:exclusive] })
        if @sub_right
          if @sub_right.update({ start_date: params[:sub_right][:start_date], end_date: params[:sub_right][:end_date], exclusive: params[:sub_right][:exclusive] })
          else
            error = true
            break
          end
        else
          @sub_right = SubRight.new({ sublicensor_id: params[:sub_right][:sublicensor_id], right_id: right_id, territory_id: territory_id, film_id: params[:sub_right][:film_id], start_date: params[:sub_right][:start_date], end_date: params[:sub_right][:end_date], exclusive: params[:sub_right][:exclusive] })
          if @sub_right.save
          else
            error = true
            break
          end
        end
      end
    end
    if error
      render json: @sub_right.errors.full_messages, status: 422
    else
      render json: @sub_right
    end
  end

  def update
    @sub_right = SubRight.find(params[:id])
    if @sub_right.update(sub_right_params)
      @sub_rights = SubRight.where(id: params[:id])
      @territories = Territory.all
      @rights = Right.all
      @films = Film.all
      render 'show.json.jbuilder'
    else
      render json: @sub_right.errors.full_messages, status: 422
    end
  end

  def destroy
    @sub_right = SubRight.find(params[:id])
    if @sub_right.destroy
      render json: @sub_right, status: 200
    else
      render json: @sub_right.errors.full_messages, status: 422
    end
  end

  private

  def sub_right_params
    params[:sub_right].permit(:sublicensor_id, :right_id, :territory_id, :start_date, :end_date, :exclusive, :film_id)
  end

end
