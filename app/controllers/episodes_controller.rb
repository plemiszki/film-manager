class EpisodesController < AdminController

  def show
    @episode = Episode.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
