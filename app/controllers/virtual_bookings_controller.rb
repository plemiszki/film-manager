class VirtualBookingsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @virtual_booking = VirtualBooking.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
