class VenuesController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @venue = Venue.find_by(id: params[:id])
    render "show.html.erb"
  end

end
