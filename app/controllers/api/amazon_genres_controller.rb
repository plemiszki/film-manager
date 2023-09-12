class Api::AmazonGenresController < AdminController

  def index
    @amazon_genres = AmazonGenre.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @amazon_genre = AmazonGenre.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    amazon_genre = AmazonGenre.new(amazon_genre_params)
    if amazon_genre.save
      @amazon_genres = AmazonGenre.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(amazon_genre)
    end
  end

  def update
    @amazon_genre = AmazonGenre.find(params[:id])
    if @amazon_genre.update(amazon_genre_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@amazon_genre)
    end
  end

  def destroy
    @amazon_genre = AmazonGenre.find(params[:id])
    @amazon_genre.destroy
    render json: @amazon_genre, status: 200
  end

  private

  def amazon_genre_params
    params[:amazon_genre].permit(:code)
  end

end
