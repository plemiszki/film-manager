class Api::PaymentsController < AdminController

  include BookingCalculations

  def create
    @payment = Payment.new(payment_params)
    if @payment.save
      @payments = Payment.where(booking_id: @payment.booking_id)
      @calculations = booking_calculations(Booking.find(@payment.booking_id))
      render 'index.json.jbuilder'
    else
      render json: @payment.errors.full_messages, status: 422
    end
  end

  def destroy
    @payment = Payment.find(params[:id])
    @payment.destroy
    @payments = Payment.where(booking_id: @payment.booking_id)
    @calculations = booking_calculations(Booking.find(@payment.booking_id))
    render 'index.json.jbuilder'
  end

  private

  def payment_params
    params.require(:payment).permit(:booking_id, :date, :amount, :notes)
  end

end
