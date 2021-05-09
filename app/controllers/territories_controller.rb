class TerritoriesController < AdminController

  def show
    @territory = Territory.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
