class MerchandiseItemsController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @merchandise_item = MerchandiseItem.find_by(id: params[:id])
    render "show.html.erb"
  end

end
