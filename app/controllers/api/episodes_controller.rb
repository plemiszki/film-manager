class Api::EpisodesController < AdminController

  def show
    @episode = Episode.find(params[:id])
    @actors = @episode.actors
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @episode = Episode.new(episode_params)
    if @episode.save
      @episodes = Episode.all
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @episode.errors.full_messages, status: 422
    end
  end

  def update
    @episode = Episode.find(params[:id])
    if @episode.update(episode_params)
      @episodes = Episode.all
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render json: @episode.errors.full_messages, status: 422
    end
  end

  def destroy
    @episode = Episode.find(params[:id])
    @episode.destroy
    render json: @episode, status: 200
  end

  private

  def episode_params
    params[:episode].permit(:film_id, :title, :season_number, :episode_number, :synopsis, :length)
  end

end
