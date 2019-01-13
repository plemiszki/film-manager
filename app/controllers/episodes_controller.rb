class EpisodesController < AdminController

  def show
    @episode = Episode.find_by(id: params[:id])
    render "show.html.erb"
  end

end
