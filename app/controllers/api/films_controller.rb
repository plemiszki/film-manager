class Api::FilmsController < ApplicationController

  def index
    @films = Film.where(short_film: params[:shorts])
    render "index.json.jbuilder"
  end

  def show
    @films = Film.where(id: params[:id])
    @templates = DealTemplate.all
    @licensors = Licensor.all
    render "show.json.jbuilder"
  end

  def create
    @film = Film.new(title: film_params[:title], label_id: 1, days_statement_due: 30, short_film: params[:short])
    if @film.save
      @films = Film.where(short_film: params[:short])
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
    result = params[:film].permit(
      :days_statement_due,
      :deal_type_id,
      :e_and_o,
      :expense_cap,
      :gr_percentage,
      :licensor_id,
      :mg,
      :royalty_notes,
      :sage_id,
      :short_film,
      :title
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

end
