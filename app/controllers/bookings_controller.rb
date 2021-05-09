class BookingsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @booking = Booking.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

  def advanced
    render "advanced.html.erb"
  end

end
