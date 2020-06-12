class VirtualBookingsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @virtual_booking = VirtualBooking.find_by(id: params[:id])
    render "show.html.erb"
  end

end
