class Api::TerritoriesController < AdminController

  def index
    @territories = Territory.all
    render 'index.json.jbuilder'
  end

  def show
    @territories = Territory.where(id: params[:id])
    render 'index.json.jbuilder'
  end

  def create
    @territory = Territory.new(territory_params)
    if @territory.save
      film_rights_with_worldwide_rights = FilmRight.where(territory_id: 1)
      film_rights_with_worldwide_rights.each do |film_right|
        FilmRight.create!(film_id: film_right.film_id, territory_id: @territory.id, right_id: film_right.right_id, start_date: film_right.start_date, end_date: film_right.end_date, exclusive: film_right.exclusive, value: true)
      end
      @territories = Territory.all
      render 'index.json.jbuilder'
    else
      render json: @territory.errors.full_messages, status: 422
    end
  end

  def update
    @territory = Territory.find(params[:id])
    if @territory.update(territory_params)
      @territories = Territory.all
      render 'index.json.jbuilder'
    else
      render json: @territory.errors.full_messages, status: 422
    end
  end

  def destroy
    @territory = Territory.find(params[:id])
    if @territory.destroy
      render json: @territory, status: 200
    else
      render json: @territory.errors.full_messages, status: 422
    end
  end

  private

  def territory_params
    params[:territory].permit(:name)
  end

end
