class PurchaseOrdersController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @purchase_order = PurchaseOrder.find_by(id: params[:id])
    render "show.html.erb"
  end

  def reporting
    render "reporting.html.erb"
  end

end
