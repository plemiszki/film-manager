class Api::PaymentsController < AdminController

  include BookingCalculations

  def create
    @payment = Payment.new(payment_params)
    if @payment.save
      @payments = Payment.where(booking_id: @payment.booking_id, booking_type: @payment.booking_type)
      @calculations = booking_calculations(@payment.booking)
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @payment.errors.full_messages, status: 422
    end
  end

  def destroy
    @payment = Payment.find(params[:id])
    @payment.destroy
    @payments = Payment.where(booking_id: @payment.booking_id, booking_type: @payment.booking_type)
    @calculations = booking_calculations(@payment.booking)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def payment_params
    params.require(:payment).permit(:booking_id, :booking_type, :date, :amount, :notes)
  end

end
