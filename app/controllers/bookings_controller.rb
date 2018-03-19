class BookingsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @booking = Booking.find_by(id: params[:id])
    render "show.html.erb"
  end

end
