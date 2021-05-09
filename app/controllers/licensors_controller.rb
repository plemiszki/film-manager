class LicensorsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @licensor = Licensor.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
