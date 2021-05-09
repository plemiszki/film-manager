class GenresController < AdminController

  def show
    @genre = Genre.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
