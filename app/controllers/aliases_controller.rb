class AliasesController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @alias = Alias.find_by(id: params[:id])
    render "show.html.erb"
  end

end
