class Api::InstitutionOrderFilmsController < AdminController

  def create
    institution_order_film = InstitutionOrderFilm.new(institution_order_film_params)
    if institution_order_film.save!
      @institution_order_films = institution_order_film.order.institution_order_films.includes(:film)
      @films = Film.where.not(id: @institution_order_films.pluck(:film_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: institution_order_film.errors.full_messages, status: 422
    end
  end

  def destroy
    institution_order_film = InstitutionOrderFilm.find(params[:id]).destroy
    @institution_order_films = institution_order_film.order.institution_order_films.includes(:film)
    @films = Film.where.not(id: @institution_order_films.pluck(:film_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def institution_order_film_params
    params.require(:institution_order_film).permit(:film_id, :institution_order_id)
  end

end
