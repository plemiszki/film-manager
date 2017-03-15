class UsersController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @user = User.find_by(id: params[:id])
    render "show.html.erb"
  end

end
