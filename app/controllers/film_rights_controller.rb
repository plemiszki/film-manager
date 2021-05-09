class FilmRightsController < AdminController

  def show
    @film_right = FilmRight.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
