class AmazonGenresController < AdminController

  def show
    @amazon_genre = AmazonGenre.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
