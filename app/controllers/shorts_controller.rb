class ShortsController < AdminController

  def index
    render "index.html.erb"
  end

  def advanced
    render 'advanced.html.erb'
  end

end
