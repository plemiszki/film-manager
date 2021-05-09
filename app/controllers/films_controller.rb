class FilmsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @film = Film.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

  def advanced
    render 'advanced.html.erb'
  end

  def catalog
    render 'catalog.html.erb'
  end

end
