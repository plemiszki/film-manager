class LicensorsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @licensor = Licensor.find_by(id: params[:id])
    render "show.html.erb"
  end

end
