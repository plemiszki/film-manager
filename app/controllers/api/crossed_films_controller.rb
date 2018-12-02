class Api::CrossedFilmsController < AdminController

  def create
    @crossed_film = CrossedFilm.new(crossed_film_params)
    if @crossed_film.save
      @crossed_films = CrossedFilm.where(film_id: @crossed_film.film_id)
      @other_crossed_films = Film.where.not(id: ([@crossed_film.film_id] + @crossed_films.pluck(:crossed_film_id)), film_type: 'Short')
      render 'index.json.jbuilder'
    else
      render json: @crossed_film.errors.full_messages, status: 422
    end
  end

  def destroy
    @crossed_film = CrossedFilm.find(params[:id])
    @crossed_film.destroy
    @crossed_films = CrossedFilm.where(film_id: @crossed_film.film_id)
    @other_crossed_films = Film.where.not(id: ([@crossed_film.film_id] + @crossed_films.pluck(:crossed_film_id)), film_type: 'Short')
    render 'index.json.jbuilder'
  end

  private

  def crossed_film_params
    params[:crossed_film].permit(:film_id, :crossed_film_id)
  end

end
