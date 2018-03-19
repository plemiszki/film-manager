class DvdsController < AdminController

  def show
    @dvd = Dvd.find_by(id: params[:id])
    render "show.html.erb"
  end

end
