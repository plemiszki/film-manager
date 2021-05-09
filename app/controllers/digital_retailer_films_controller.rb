class DigitalRetailerFilmsController < AdminController

  def show
    @digital_retailer_film = DigitalRetailerFilm.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
