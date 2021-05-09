class UsersController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @user = User.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
