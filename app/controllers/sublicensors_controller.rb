class SublicensorsController < AdminController

  def index
    render 'index.html.erb'
  end

  def show
    @sublicensor = Sublicensor.find_by(id: params[:id])
    render 'show.html.erb'
  end

end
