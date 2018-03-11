class GenresController < ApplicationController

  def show
    @genre = Genre.find_by(id: params[:id])
    render "show.html.erb"
  end

end
