class Api::FilmsController < ApplicationController

  def index
    @films = Film.where(short_film: false)
    render "index.json.jbuilder"
  end

  def show
    @films = Film.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @film = Film.new(name: film_params[:name], email: "", address: "")
    if @film.save
      @films = Film.all
      render "index.json.jbuilder"
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def update
    @film = Film.find(params[:id])
    if @film.update(film_params)
      @films = Film.where(id: params[:id])
      render "show.json.jbuilder"
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def destroy
    @film = Film.find(params[:id])
    if @film.destroy
      render json: @film, status: 200
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  private

  def film_params
    params[:film].permit(:name)
  end

end
