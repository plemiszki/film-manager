class Api::GenresController < AdminController

  def index
    @genres = Genre.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @genre = Genre.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @genre = Genre.new(genre_params)
    if @genre.save
      @genres = Genre.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@genre)
    end
  end

  def update
    @genre = Genre.find(params[:id])
    if @genre.update(genre_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@genre)
    end
  end

  def destroy
    @genre = Genre.find(params[:id])
    if @genre.destroy
      render json: @genre, status: 200
    else
      render_errors(@genre)
    end
  end

  private

  def genre_params
    params[:genre].permit(:name, :prime_code)
  end

end
