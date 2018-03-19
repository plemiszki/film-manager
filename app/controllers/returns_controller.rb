class ReturnsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @return = Return.find_by(id: params[:id])
    render "show.html.erb"
  end

end
