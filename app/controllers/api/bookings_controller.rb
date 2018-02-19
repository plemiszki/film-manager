class Api::BookingsController < ApplicationController

  def index
    @bookings = Booking.all.includes(:film, :venue)
    render "index.json.jbuilder"
  end

  def show
    @bookings = Booking.where(id: params[:id])
    @films = Film.where(short_film: false)
    @venues = Venue.all
    @users = User.all
    render "show.json.jbuilder"
  end

  # def create
  #   @giftbox = Giftbox.new(name: giftbox_params[:name], upc: giftbox_params[:upc])
  #   if @giftbox.save
  #     @giftboxes = Giftbox.all
  #     render "index.json.jbuilder"
  #   else
  #     render json: @giftbox.errors.full_messages, status: 422
  #   end
  # end

  def update
    @booking = Booking.find(params[:id])
    if @booking.update(booking_params)
      @bookings = Booking.where(id: params[:id])
      @films = Film.where(short_film: false)
      @venues = Venue.all
      @users = User.all
      render "show.json.jbuilder"
    else
      render json: @booking.errors.full_messages, status: 422
    end
  end

  def destroy
    @bookings = Booking.find(params[:id])
    if @bookings.destroy
      render json: @bookings, status: 200
    else
      render json: @bookings.errors.full_messages, status: 422
    end
  end

  private

  def booking_params
    params[:booking].permit(:film_id, :venue_id, :start_date, :end_date, :booking_type, :status, :screenings, :email, :booker_id, :user_id, :format, :premiere, :advance, :shipping_fee, :deduction, :house_expense, :terms_change, :terms, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :materials_sent, :tracking_number, :shipping_notes)
  end

end
