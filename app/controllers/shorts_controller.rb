class ShortsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def advanced
    render 'advanced.html.erb'
  end

end
