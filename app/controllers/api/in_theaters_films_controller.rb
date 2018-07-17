class Api::InTheatersFilmsController < AdminController

  include Reorderable

  def index
    index_data
    render 'index.json.jbuilder'
  end

  def create
    current_length = InTheatersFilm.where(section: film_params[:section]).length
    @film = InTheatersFilm.new(film_id: film_params[:film_id], section: film_params[:section], order: current_length)
    if @film.save
      index_data
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film = InTheatersFilm.find(params[:id]).destroy
    reorder(InTheatersFilm.where(section: @film.section).order(:order))
    index_data
    render 'index.json.jbuilder'
  end

  def rearrange
    params[:new_order].each do |index, id|
      film = InTheatersFilm.find(id)
      film.update(order: index)
    end
    index_data
    render 'index.json.jbuilder'
  end

  private

  def film_params
    params[:film].permit(:film_id, :order, :section)
  end

  def index_data
    @in_theaters = InTheatersFilm.where(section: 'In Theaters').includes(:film)
    @coming_soon = InTheatersFilm.where(section: 'Coming Soon').includes(:film)
    @films = Film.where.not(id: (@in_theaters.pluck(:film_id) + @coming_soon.pluck(:film_id))).where(film_type: 'Feature')
  end

end
