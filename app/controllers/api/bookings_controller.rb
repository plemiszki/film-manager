class Api::BookingsController < ApplicationController

  def index
    @bookings = Booking.all.includes(:film, :venue)
    @films = Film.where(short_film: false)
    @venues = Venue.all
    @users = User.all
    render "index.json.jbuilder"
  end

  def show
    @bookings = Booking.where(id: params[:id])
    @weekly_terms = WeeklyTerm.where(booking_id: params[:id])
    @weekly_box_offices = WeeklyBoxOffice.where(booking_id: params[:id])
    @payments = Payment.where(booking_id: params[:id])
    @films = Film.where(short_film: false)
    @venues = Venue.all
    @users = User.all
    render "show.json.jbuilder"
  end

  def create
    @booking = Booking.new(booking_params)
    @booking.user_id = current_user.id
    if @booking.save
      venue = Venue.find(@booking.venue_id)
      @booking.billing_name = venue.billing_name
      @booking.billing_address1 = venue.billing_address1
      @booking.billing_address2 = venue.billing_address2
      @booking.billing_city = venue.billing_city
      @booking.billing_state = venue.billing_state
      @booking.billing_zip = venue.billing_zip
      @booking.billing_country = venue.billing_country
      @booking.shipping_name = venue.shipping_name
      @booking.shipping_address1 = venue.shipping_address1
      @booking.shipping_address2 = venue.shipping_address2
      @booking.shipping_city = venue.shipping_city
      @booking.shipping_state = venue.shipping_state
      @booking.shipping_zip = venue.shipping_zip
      @booking.shipping_country = venue.shipping_country
      @booking.email = venue.email
      @booking.save!
      render "create.json.jbuilder"
    else
      render json: @booking.errors.full_messages, status: 422
    end
  end

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

  def send_confirmation
    @bookings = Booking.where(id: params[:id]).includes(:film)
    email_text = get_email_text(@bookings.first)
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    message_params =  { from: 'michael@filmmovement.com',
                        to: @bookings.first.email,
                        # to: 'plemiszki@gmail.com',
                        cc: current_user.email,
                        subject: "Your Film Movement Booking Confirmation",
                        text: email_text
                      }
    mg_client.send_message 'filmmovement.com', message_params
    # @bookings.first.update(booking_confirmation_sent: )
    render "show.json.jbuilder"
  end

  private

  def booking_params
    params[:booking].permit(:film_id, :venue_id, :date_added, :start_date, :end_date, :booking_type, :status, :screenings, :email, :booker_id, :format, :premiere, :advance, :shipping_fee, :deduction, :house_expense, :terms_change, :terms, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :materials_sent, :tracking_number, :shipping_notes, :box_office)
  end

  def get_email_text(booking)
    string = "Hello,\n\n"
    string += "Please see the following booking confirmation for #{booking.film.title}"
    string += " on #{booking.format}" unless booking.format.empty?
    string += "\n\n"
    string += "#{booking.start_date == booking.end_date ? "Screening" : "Start"} Date: #{booking.start_date.strftime("%-m/%-d/%y")}\n\n"
    string += "#{booking.shipping_name}\n"
    string += "#{booking.shipping_address1}\n"
    string += "#{booking.shipping_address2}\n" unless booking.shipping_address2.empty?
    string += "#{booking.shipping_city}, #{booking.shipping_state} #{booking.shipping_zip}\n"
    string += "#{booking.shipping_country}\n" unless booking.shipping_country == "USA" || booking.shipping_country == "US"
    string += "\nYou will find the synopsis, photos, poster art and press kit to download on our website:\n"
    string += "http://www.filmmovement.com/films/#{booking.film.title.gsub(/\s'.,?]/, "")}\n\n"
    if booking.film.standalone_site
      # standalone site
    end
    if booking.film.youtube_trailer
      # youtube trailer
    end
    if booking.film.prores_trailer
      # prores trailer download
    end
    string += "#{Setting.first.booking_confirmation_text}\n\n"
    # social media links
    string += "Best,\n\n"
    string += current_user.email_signature
  end

end
