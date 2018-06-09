class Api::InTheatersFilmsController < AdminController

  include Reorderable

  def index
    index_data
    render 'index.json.jbuilder'
  end

  def create
    current_length = InTheatersFilm.where(coming_soon: film_params[:coming_soon]).length
    @film = InTheatersFilm.new(film_id: film_params[:film_id], coming_soon: film_params[:coming_soon], order: current_length)
    if @film.save
      index_data
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film = InTheatersFilm.find(params[:id]).destroy
    reorder(InTheatersFilm.where(coming_soon: @film.coming_soon).order(:order))
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
    params[:film].permit(:film_id, :order, :coming_soon)
  end

  def index_data
    @in_theaters = InTheatersFilm.where(coming_soon: false).includes(:film)
    @coming_soon = InTheatersFilm.where(coming_soon: true).includes(:film)
    @films = Film.where.not(id: (@in_theaters.pluck(:film_id) + @coming_soon.pluck(:film_id))).where(film_type: 'Feature')
  end

end
