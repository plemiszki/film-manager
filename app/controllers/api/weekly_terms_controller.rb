class Api::WeeklyTermsController < AdminController

  include Reorderable
  include BookingCalculations

  def create
    current_length = WeeklyTerm.where(booking_id: weekly_terms_params[:booking_id]).length
    @weekly_term = WeeklyTerm.new(booking_id: weekly_terms_params[:booking_id], order: current_length, terms: weekly_terms_params[:terms])
    if @weekly_term.save
      @weekly_terms = WeeklyTerm.where(booking_id: @weekly_term.booking_id)
      @calculations = booking_calculations(Booking.find(@weekly_term.booking_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @weekly_term.errors.full_messages, status: 422
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

  def weekly_terms_params
    params[:weekly_terms].permit(:booking_id, :order, :terms)
  end

end
