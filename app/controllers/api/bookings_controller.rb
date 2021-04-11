class Api::BookingsController < AdminController

  include BookingCalculations
  include SearchIndex

  def index
    if params[:search_criteria] && params[:search_criteria][:materials_sent]
      if params[:search_criteria][:materials_sent][:value] == "f"
        params[:search_criteria][:materials_sent][:value] = nil
      else
        params[:search_criteria][:materials_sent].delete(:value)
        params[:search_criteria][:materials_sent][:not] = nil
      end
    end
    @bookings = perform_search(model: 'Booking', associations: ['film', 'venue', 'format', 'payments', 'weekly_box_offices', 'invoices'])
    @calculations = {}
    @bookings.each do |booking|
      @calculations[booking.id] = booking_calculations(booking)
    end
    render 'index.json.jbuilder'
  end

  def new
    @films = Film.all.order(:title)
    @venues = Venue.all.order(:label)
    @users = User.active_bookers.order(:name)
    @formats = Format.all.order(:name)
    render 'new.json.jbuilder'
  end

  def show
    @bookings = Booking.where(id: params[:id]).includes(:invoices)
    @invoices = @bookings.first.invoices.includes(:invoice_rows)
    @weekly_terms = WeeklyTerm.where(booking_id: params[:id])
    @weekly_box_offices = WeeklyBoxOffice.where(booking_id: params[:id])
    @payments = Payment.where(booking_id: params[:id])
    @films = Film.all
    @venues = Venue.all
    @users = User.all
    @formats = Format.all
    @calculations = booking_calculations(@bookings.first)
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

  def copy
    if params[:booking][:film_id]
      original_booking = Booking.find(params[:booking][:from_id])
      @booking = Booking.new
      @booking.film_id = params[:booking][:film_id]
      @booking.user_id = current_user.id
      @booking.date_added = Date.today
      @booking.venue_id = original_booking.venue_id
      @booking.booking_type = original_booking.booking_type
      @booking.status = original_booking.status
      @booking.start_date = original_booking.start_date
      @booking.end_date = original_booking.end_date
      @booking.terms = original_booking.terms
      @booking.terms_change = original_booking.attributes["terms_change"]
      @booking.advance = original_booking.advance
      @booking.shipping_fee = original_booking.shipping_fee
      @booking.screenings = original_booking.screenings
      @booking.booker_id = original_booking.booker_id
      @booking.billing_name = original_booking.billing_name
      @booking.billing_address1 = original_booking.billing_address1
      @booking.billing_address2 = original_booking.billing_address2
      @booking.billing_city = original_booking.billing_city
      @booking.billing_state = original_booking.billing_state
      @booking.billing_zip = original_booking.billing_zip
      @booking.billing_country = original_booking.billing_country
      @booking.shipping_name = original_booking.shipping_name
      @booking.shipping_address1 = original_booking.shipping_address1
      @booking.shipping_address2 = original_booking.shipping_address2
      @booking.shipping_city = original_booking.shipping_city
      @booking.shipping_state = original_booking.shipping_state
      @booking.shipping_zip = original_booking.shipping_zip
      @booking.shipping_country = original_booking.shipping_country
      @booking.email = original_booking.email
      @booking.premiere = original_booking.premiere
      @booking.house_expense = original_booking.house_expense
      @booking.notes = original_booking.notes
      @booking.format_id = original_booking.format_id
      @booking.deduction = original_booking.deduction
      @booking.save!
      if @booking.attributes["terms_change"]
        original_booking.weekly_terms.each do |weekly_term|
          WeeklyTerm.create!({ booking_id: @booking.id, terms: weekly_term.terms, order: weekly_term.order })
        end
      end
      render "create.json.jbuilder"
    else
      render json: ["Film can't be blank"], status: 422
    end
  end

  def update
    @booking = Booking.find(params[:id])
    if @booking.update(booking_params)
      @bookings = Booking.where(id: params[:id]).includes(:invoices)
      @invoices = @bookings.first.invoices
      @films = Film.all
      @venues = Venue.all
      @users = User.all
      @formats = Format.all
      @calculations = booking_calculations(@bookings.first)
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
    message_params =  { from: current_user.email,
                        to: @bookings.first.email,
                        cc: current_user.email,
                        subject: "Your Film Movement Booking Confirmation",
                        text: email_text
                      }
    mg_client.send_message 'filmmovement.com', message_params if Rails.env.production?
    @bookings.first.update(booking_confirmation_sent: Date.today)
    @calculations = booking_calculations(@bookings.first)
    render "show.json.jbuilder"
  end

  def export
    booking_ids = params[:booking_ids].to_a.map(&:to_i)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export bookings", first_line: "Exporting Bookings", second_line: true, current_value: 0, total_value: booking_ids.length)
    ExportBookings.perform_async(booking_ids, time_started)
    render json: job.render_json
  end

  private

  def booking_params
    params[:booking].permit(:film_id, :venue_id, :date_added, :start_date, :end_date, :booking_type, :status, :screenings, :email, :booker_id, :format, :premiere, :advance, :shipping_fee, :deduction, :house_expense, :terms_change, :terms, :billing_name, :billing_address1, :billing_address2, :billing_city, :billing_state, :billing_zip, :billing_country, :shipping_name, :shipping_address1, :shipping_address2, :shipping_city, :shipping_state, :shipping_zip, :shipping_country, :materials_sent, :tracking_number, :shipping_notes, :box_office, :box_office_received, :format_id, :notes, :exclude_from_bo_requests)
  end

  def get_email_text(booking)
    string = "Hello,\n\n"
    string += "Please see the following booking confirmation for #{booking.film.title}"
    string += " on #{booking.format.name}"
    string += "\n\n"
    string += "#{booking.start_date == booking.end_date ? "Screening" : "Start"} Date: #{booking.start_date.strftime("%-m/%-d/%y")}\n\n"
    string += "#{booking.shipping_name}\n"
    string += "#{booking.shipping_address1}\n"
    string += "#{booking.shipping_address2}\n" unless booking.shipping_address2.empty?
    string += "#{booking.shipping_city}, #{booking.shipping_state} #{booking.shipping_zip}\n"
    string += "#{booking.shipping_country}\n" unless booking.shipping_country == "USA" || booking.shipping_country == "US"
    string += "\n"
    unless booking.film.standalone_site.empty?
      string += "The film's official website is:\n"
      string += "#{booking.film.standalone_site}\n\n"
    end
    unless booking.film.youtube_trailer.empty?
      string += "Here's a link to the trailer:\n"
      string += "#{booking.film.youtube_trailer}\n\n"
    end
    unless booking.film.prores_trailer.empty?
      string += "You can download a ProRes version of the trailer at:\n"
      string += "#{booking.film.prores_trailer}\n\n"
    end
    string += "#{Setting.first.booking_confirmation_text}\n\n"
    unless booking.film.facebook_link.empty? && booking.film.twitter_link.empty? && booking.film.instagram_link.empty?
      string += "SOCIAL MEDIA LINKS\n"
      string += "Facebook: #{booking.film.facebook_link}\n" unless booking.film.facebook_link.empty?
      string += "Twitter: #{booking.film.twitter_link}\n" unless booking.film.twitter_link.empty?
      string += "Instagram: #{booking.film.instagram_link}\n" unless booking.film.instagram_link.empty?
      string += "\n"
    end
    string += "Best,\n\n"
    string += current_user.email_signature
  end

end
