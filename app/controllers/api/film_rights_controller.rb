class Api::FilmRightsController < AdminController

  def show
    @film_right = FilmRight.find(params[:id])
    @territories = Territory.all
    @rights = Right.all
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    error = false
    params[:rights].each do |right_id|
      params[:territories].each do |territory_id|
        @film_right = FilmRight.find_by({ film_id: params[:film_right][:film_id], right_id: right_id, territory_id: territory_id })
        if @film_right
          if @film_right.update!({ start_date: params[:film_right][:start_date], end_date: params[:film_right][:end_date], exclusive: params[:film_right][:exclusive] })
          else
            error = true
            break
          end
        else
          @film_right = FilmRight.new({ film_id: params[:film_right][:film_id], right_id: right_id, territory_id: territory_id, start_date: params[:film_right][:start_date], end_date: params[:film_right][:end_date], exclusive: params[:film_right][:exclusive] })
          if @film_right.save!
          else
            error = true
            break
          end
        end
      end
    end
    if error
      render_errors(@film_right)
    else
      @film_rights = FilmRight.where(film_id: params[:film_right][:film_id]).includes(:film)
      render 'create', formats: [:json], handlers: [:jbuilder]
    end
  end

  def update
    @film_right = FilmRight.find(params[:id])
    if @film_right.update(film_right_params)
      @territories = Territory.all
      @rights = Right.all
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@film_right)
    end
  end

  def destroy
    @film_right = FilmRight.find(params[:id])
    unless SubRight.find_by({ right_id: @film_right.right_id, territory_id: @film_right.territory_id, film_id: @film_right.film_id })
      @film_right.destroy
      render json: @film_right, status: 200
    else
      @film_right.errors.add(:base, "Right has been sublicensed")
      render_errors(@film_right)
    end
  end

  def rights_and_territories
    @rights = Right.all.order(:order)
    @territories = Territory.all.order(:name)
    @films = Film.all if params[:films_too] == "true"
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def change_dates
    errors = []
    film_id = params[:film_id]
    start_date = params[:start_date]
    end_date = params[:end_date]
    if film_id
      if start_date || end_date
        test_film_right = FilmRight.new({
          film_id: (Film.count + 1),
          right_id: (Right.count + 1),
          territory_id: (Territory.count + 1),
          start_date: start_date,
          end_date: end_date
        })
        if test_film_right.valid?
          update_object = {}
          update_object[:start_date] = start_date unless start_date.empty?
          update_object[:end_date] = end_date unless end_date.empty?
          FilmRight.where(film_id: film_id).each do |film_right|
            film_right.update!(update_object)
          end
        else
          errors += test_film_right.errors.full_messages
        end
      else
        errors << 'Start date or end date required'
      end
    else
      errors << 'Film ID required'
    end
    if errors.present?
      render json: errors, status: 422
    else
      @film_rights = FilmRight.where(film_id: film_id).includes(:film)
      render 'create', formats: [:json], handlers: [:jbuilder], status: 200
    end
  end

  private

  def film_right_params
    params[:film_right].permit(:film_id, :right_id, :territory_id, :start_date, :end_date, :exclusive)
  end

end
