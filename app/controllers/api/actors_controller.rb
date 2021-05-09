class Api::ActorsController < AdminController

  include Reorderable

  def create
    current_length = Actor.where(actorable_id: actor_params[:actorable_id], actorable_type: actor_params[:actorable_type]).length
    @actor = Actor.new(actor_params.merge({ order: current_length }))
    if @actor.save
      @actors = Actor.where(actorable_id: @actor.actorable_id, actorable_type: @actor.actorable_type)
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @actor.errors.full_messages, status: 422
    end
  end

  def destroy
    @actor = Actor.find(params[:id])
    @actor.destroy
    reorder(Actor.where(actorable_id: @actor.actorable_id, actorable_type: @actor.actorable_type).order(:order))
    @actors = Actor.where(actorable_id: @actor.actorable_id, actorable_type: @actor.actorable_type)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def rearrange
    params[:new_order].each do |index, id|
      actor = Actor.find(id)
      actor.update(order: index)
    end
    @actors = Actor.where(actorable_id: params[:actorable_id], actorable_type: params[:actorable_type]).order(:order)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def actor_params
    params[:actor].permit(:actorable_id, :actorable_type, :first_name, :last_name)
  end

end
