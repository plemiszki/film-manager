class Api::DirectorsController < AdminController

  def create
    @director = Director.new(director_params)
    if @director.save
      @directors = Director.where(film_id: @director.film_id)
      render "index.json.jbuilder"
    else
      render json: @director.errors.full_messages, status: 422
    end
  end

  def destroy
    @director = Director.find(params[:id])
    @director.destroy
    @directors = Director.where(film_id: @director.film_id)
    render "index.json.jbuilder"
  end

  private

  def director_params
    params[:director].permit(:film_id, :first_name, :last_name)
  end

end
