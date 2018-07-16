class Api::SubRightsController < AdminController

  def show
    @sub_rights = SubRight.where(id: params[:id])
    @territories = Territory.all
    @rights = Right.all
    render 'show.json.jbuilder'
  end

  def create
    error = false
    params[:rights].each do |right_id|
      params[:territories].each do |territory_id|
        @sub_right = SubRight.find_by({ sub_id: params[:sub_right][:sub_id], right_id: right_id, territory_id: territory_id })
        if @sub_right
          if @sub_right.update({ start_date: params[:sub_right][:start_date], end_date: params[:sub_right][:end_date], exclusive: params[:sub_right][:exclusive] })
          else
            error = true
            break
          end
        else
          @sub_right = SubRight.new({ sub_id: params[:sub_right][:sub_id], right_id: right_id, territory_id: territory_id, start_date: params[:sub_right][:start_date], end_date: params[:sub_right][:end_date], exclusive: params[:sub_right][:exclusive] })
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
      @sub_rights = SubRight.where(id: params[:id]).includes(:sub)
      @territories = Territory.all
      @rights = Right.all
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
    params[:sub_right].permit(:sub_id, :right_id, :territory_id, :start_date, :end_date, :exclusive)
  end

end
