class FilmsController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @film = Film.find_by(id: params[:id])
    render "show.html.erb"
  end

end
