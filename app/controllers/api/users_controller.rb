class Api::UsersController < Clearance::UsersController

  include RenderErrors

  def api_index
    @users = User.where.not(name: "Producer")
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @user = User.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def api_create
    @user = User.new(user_params)
    if @user.save
      @users = User.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@user)
    end
  end

  def api_update
    @user = User.find(params[:id])
    if @user.update(user_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@user)
    end
  end

  def api_destroy
    @user = User.find(params[:id])
    bookings = @user.bookings
    entered_bookings = @user.entered_bookings
    if bookings.length > 0 || entered_bookings.length > 0
      past_booker = PastBooker.create(name: @user.name)
      bookings.each do |booking|
        booking.update(old_booker_id: past_booker.id)
      end
      entered_bookings.each do |entered_booking|
        entered_booking.update(old_user_id: past_booker.id)
      end
    end
    @user.destroy
    render json: @user, status: 200
  end

  private

  def user_params
    params[:user].permit(:name, :email, :password, :title, :email_signature, :has_auto_renew_approval)
  end

end
