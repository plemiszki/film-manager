class TopicsController < AdminController

  def show
    @topic = Topic.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
