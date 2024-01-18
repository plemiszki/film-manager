class Api::InstitutionOrderFilmsController < AdminController

  def create
    institution_order_film = InstitutionOrderFilm.new(institution_order_film_params)
    if institution_order_film.save
      @institution_order_films = institution_order_film.order.institution_order_films.includes(:film)
      @films = Film.where.not(id: @institution_order_films.pluck(:film_id))
      @institution_order = institution_order_film.order
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(institution_order_film)
    end
  end

  def destroy
    institution_order_film = InstitutionOrderFilm.find(params[:id]).destroy
    @institution_order_films = institution_order_film.order.institution_order_films.includes(:film)
    @films = Film.where.not(id: @institution_order_films.pluck(:film_id))
    @institution_order = institution_order_film.order
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def institution_order_film_params
    params.require(:institution_order_film).permit(:film_id, :institution_order_id, :price, :licensed_rights, :formats)
  end

end
