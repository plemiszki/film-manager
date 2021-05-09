class PurchaseOrdersController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @purchase_order = PurchaseOrder.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

  def reporting
    render 'reporting', formats: [:html], handlers: [:erb]
  end

end
