class Api::DirectorsController < AdminController

  include Reorderable

  def create
    @director = Director.new(director_params.merge({ order: Director.where(film_id: director_params[:film_id]).count }))
    if @director.save
      @directors = Director.where(film_id: @director.film_id)
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @director.errors.full_messages, status: 422
    end
  end

  def destroy
    @director = Director.find(params[:id])
    @director.destroy
    reorder(Director.where(film_id: @director.film_id).order(:order))
    @directors = Director.where(film_id: @director.film_id)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def rearrange
    params[:new_order].each do |index, id|
      director = Director.find(id)
      director.update(order: index)
    end
    @directors = Director.where(film_id: params[:film_id])
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def director_params
    params[:director].permit(:film_id, :first_name, :last_name)
  end

end
