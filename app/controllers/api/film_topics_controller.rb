class Api::FilmTopicsController < ApplicationController

  def create
    @film_topic = FilmTopic.new(film_topic_params)
    if @film_topic.save
      @film_topics = FilmTopic.where(film_id: @film_topic.film_id).includes(:films)
      render 'index.json.jbuilder'
    end
  end

  def destroy
    @film_topic = FilmTopic.find(params[:id])
    @film_topic.destroy
    @film_topics = FilmTopic.where(film_id: @film_topic.film_id).includes(:film)
    render 'index.json.jbuilder'
  end

  private

  def film_topic_params
    params[:film_topic].permit(:film_id, :topic_id)
  end

end
