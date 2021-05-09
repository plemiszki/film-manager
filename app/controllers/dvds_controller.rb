class DvdsController < AdminController

  def show
    @dvd = Dvd.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
