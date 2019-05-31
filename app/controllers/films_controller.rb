class FilmsController < AdminController

  def index
    render 'index.html.erb'
  end

  def show
    @film = Film.find_by(id: params[:id])
    render 'show.html.erb'
  end

  def advanced
    render 'advanced.html.erb'
  end

  def catalog
    render 'catalog.html.erb'
  end

end
