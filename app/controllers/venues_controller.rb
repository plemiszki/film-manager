class VenuesController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @venue = Venue.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
