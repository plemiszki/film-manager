class Api::LaurelsController < ApplicationController

  include Reorderable

  def create
    current_length = Laurel.where(film_id: laurel_params[:film_id]).length
    @laurel = Laurel.new(laurel_params.merge({ order: current_length }))
    if @laurel.save
      @laurels = Laurel.where(film_id: @laurel.film_id).order(:order)
      render "index.json.jbuilder"
    else
      render json: @laurel.errors.full_messages, status: 422
    end
  end

  def destroy
    @laurel = Laurel.find(params[:id])
    @laurel.destroy
    reorder(Laurel.where(film_id: @laurel.film_id).order(:order))
    @laurels = Laurel.where(film_id: @laurel.film_id).order(:order)
    render "index.json.jbuilder"
  end

  private

  def laurel_params
    params[:laurel].permit(:film_id, :result, :award_name, :festival)
  end

end
