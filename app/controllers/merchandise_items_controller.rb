class MerchandiseItemsController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @merchandise_item = MerchandiseItem.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
