class Api::TopicsController < AdminController

  def index
    @topics = Topic.all
    render "index.json.jbuilder"
  end

  def show
    @topic = Topic.find(params[:id])
    render "show.json.jbuilder"
  end

  def create
    @topic = Topic.new(topic_params)
    if @topic.save
      @topics = Topic.all
      render "index.json.jbuilder"
    else
      render json: @topic.errors.full_messages, status: 422
    end
  end

  def update
    @topic = Topic.find(params[:id])
    if @topic.update(topic_params)
      render "show.json.jbuilder"
    else
      render json: @topic.errors.full_messages, status: 422
    end
  end

  def destroy
    @topic = Topic.find(params[:id])
    if @topic.destroy
      render json: @topic, status: 200
    else
      render json: @topic.errors.full_messages, status: 422
    end
  end

  private

  def topic_params
    params[:topic].permit(:name)
  end

end
