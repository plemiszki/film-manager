class Api::UsersController < Clearance::UsersController

  def api_index
    @users = User.all
    render "index.json.jbuilder"
  end

  def show
    @users = User.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def api_create
    @user = User.new(user_params)
    if @user.save
      @users = User.all
      render "index.json.jbuilder"
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  def api_update
    @user = User.find(params[:user][:id])
    if @user.update(user_params)
      render "user-profile-edit.json.jbuilder"
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  def api_destroy
    @user = User.find(params[:id])
    if @user.destroy
      render json: @user, status: 200
    else
      render json: @user.errors.full_messages, status: 422
    end
  end

  private

  def user_params
    params[:user].permit(:name, :email, :password, :title, :email_signature)
  end

end
