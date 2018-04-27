class BookersController < AdminController

  def index
    render 'index.html.erb'
  end

  def show
    @booker = Booker.find_by(id: params[:id])
    render 'show.html.erb'
  end

end
