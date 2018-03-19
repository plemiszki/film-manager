class Api::GenresController < AdminController

  def index
    @genres = Genre.all
    render "index.json.jbuilder"
  end

  def show
    @genres = Genre.where(id: params[:id])
    render "index.json.jbuilder"
  end

  def create
    @genre = Genre.new(genre_params)
    if @genre.save
      @genres = Genre.all
      render "index.json.jbuilder"
    else
      render json: @genre.errors.full_messages, status: 422
    end
  end

  def update
    @genre = Genre.find(params[:id])
    if @genre.update(genre_params)
      @genres = Genre.all
      render "index.json.jbuilder"
    else
      render json: @genre.errors.full_messages, status: 422
    end
  end

  def destroy
    @genre = Genre.find(params[:id])
    if @genre.destroy
      render json: @genre, status: 200
    else
      render json: @genre.errors.full_messages, status: 422
    end
  end

  private

  def genre_params
    params[:genre].permit(:name)
  end

end
