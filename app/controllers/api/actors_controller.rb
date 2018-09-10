class Api::ActorsController < AdminController

  include Reorderable

  def create
    current_length = Actor.where(film_id: actor_params[:film_id]).length
    @actor = Actor.new(actor_params.merge({ order: current_length }))
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
    reorder(Actor.where(film_id: @actor.film_id).order(:order))
    @actors = Actor.where(film_id: @actor.film_id)
    render "index.json.jbuilder"
  end

  def rearrange
  end

  private

  def actor_params
    params[:actor].permit(:film_id, :first_name, :last_name)
  end

end
