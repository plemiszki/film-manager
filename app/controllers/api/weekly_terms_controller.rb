class Api::WeeklyTermsController < AdminController

  include Reorderable
  include BookingCalculations

  def create
    current_length = WeeklyTerm.where(booking_id: weekly_term_params[:booking_id]).length
    @weekly_term = WeeklyTerm.new(booking_id: weekly_term_params[:booking_id], order: current_length, terms: weekly_term_params[:terms])
    if @weekly_term.save
      @weekly_terms = WeeklyTerm.where(booking_id: @weekly_term.booking_id)
      @calculations = booking_calculations(Booking.find(@weekly_term.booking_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@weekly_term)
    end
  end

  def destroy
    @weekly_term = WeeklyTerm.find(params[:id])
    @weekly_term.destroy
    reorder(WeeklyTerm.where(booking_id: @weekly_term.booking_id).order(:order))
    @weekly_terms = WeeklyTerm.where(booking_id: @weekly_term.booking_id)
    @calculations = booking_calculations(Booking.find(@weekly_term.booking_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def weekly_term_params
    params[:weekly_term].permit(:booking_id, :order, :terms)
  end

end
