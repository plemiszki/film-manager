class TopicsController < ApplicationController

  def show
    @topic = Topic.find_by(id: params[:id])
    render "show.html.erb"
  end

end
