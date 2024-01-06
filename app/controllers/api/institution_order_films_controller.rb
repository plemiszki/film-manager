class Api::InstitutionOrderFilmsController < AdminController

  def create
    institutional_order_film = InstitutionalOrderFilm.new(institutional_order_film_params)
    if institutional_order_film.save!
      @institutional_order_films = institutional_order_film.order.institutional_order_films.includes(:film)
      @films = Film.where.not(id: @institutional_order_films.pluck(:film_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: institutional_order_film.errors.full_messages, status: 422
    end
  end

  def destroy
    institutional_order_film = InstitutionalOrderFilm.find(params[:id]).destroy
    @institutional_order_films = institutional_order_film.order.institutional_order_films.includes(:film)
    @films = Film.where.not(id: @institutional_order_films.pluck(:film_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def institutional_order_film_params
    params.require(:institutional_order_film).permit(:film_id, :institutional_order_id)
  end

end
