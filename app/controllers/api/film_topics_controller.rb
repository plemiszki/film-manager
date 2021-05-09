class Api::FilmTopicsController < AdminController

  def create
    @film_topic = FilmTopic.new(film_topic_params)
    if @film_topic.save
      @film_topics = FilmTopic.where(film_id: @film_topic.film_id).includes(:film)
      @topics = Topic.where.not(id: @film_topics.pluck(:topic_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    end
  end

  def destroy
    @film_topic = FilmTopic.find(params[:id])
    @film_topic.destroy
    @film_topics = FilmTopic.where(film_id: @film_topic.film_id).includes(:film)
    @topics = Topic.where.not(id: @film_topics.pluck(:topic_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def film_topic_params
    params[:film_topic].permit(:film_id, :topic_id)
  end

end
