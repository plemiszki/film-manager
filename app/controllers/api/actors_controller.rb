class Api::ActorsController < ApplicationController

  def create
    @actor = Actor.new(actor_params)
    if @actor.save
      @actors = Actor.where(film_id: @actor.film_id)
      render "index.json.jbuilder"
    else
      render json: @actor.errors.full_messages, status: 422
    end
  end

  def destroy
    @actor = Actor.find(params[:id])
    @actor.destroy
    @actors = Actor.where(film_id: @actor.film_id)
    render "index.json.jbuilder"
  end

  private

  def actor_params
    params[:actor].permit(:film_id, :first_name, :last_name)
  end

end
