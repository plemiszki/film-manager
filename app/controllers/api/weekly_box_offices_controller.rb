class Api::WeeklyBoxOfficesController < AdminController

  include Reorderable
  include BookingCalculations

  def create
    current_length = WeeklyBoxOffice.where(booking_id: weekly_box_office_params[:booking_id]).length
    @weekly_box_office = WeeklyBoxOffice.new(booking_id: weekly_box_office_params[:booking_id], order: current_length, amount: weekly_box_office_params[:amount])
    if @weekly_box_office.save
      @weekly_box_offices = WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id)
      @calculations = booking_calculations(Booking.find(@weekly_box_office.booking_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@weekly_box_office)
    end
  end

  def destroy
    @weekly_box_office = WeeklyBoxOffice.find(params[:id])
    @weekly_box_office.destroy
    reorder(WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id).order(:order))
    @weekly_box_offices = WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id)
    @calculations = booking_calculations(Booking.find(@weekly_box_office.booking_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def weekly_box_office_params
    params[:weekly_box_office].permit(:booking_id, :order, :amount)
  end

end
