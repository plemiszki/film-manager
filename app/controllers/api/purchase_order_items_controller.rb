class Api::PurchaseOrderItemsController < AdminController

  include PurchaseOrderItems
  include Reorderable

  def create
    current_length = PurchaseOrderItem.where(purchase_order_id: purchase_order_item_params[:purchase_order_id]).length
    @purchase_order_item = PurchaseOrderItem.new(purchase_order_id: purchase_order_item_params[:purchase_order_id], item_id: purchase_order_item_params[:item_id], item_type: purchase_order_item_params[:item_type], qty: purchase_order_item_params[:qty], order: current_length)
    if @purchase_order_item.save
      @purchase_order = PurchaseOrder.find(@purchase_order_item.purchase_order_id)
      get_data_for_items
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: @purchase_order_item.errors.full_messages, status: 422
    end
  end

  def destroy
    @purchase_order_item = PurchaseOrderItem.find(params[:id])
    @purchase_order_item.destroy
    reorder(PurchaseOrderItem.where(purchase_order_id: @purchase_order_item.purchase_order_id).order(:order))
    @purchase_order = PurchaseOrder.find(@purchase_order_item.purchase_order_id)
    get_data_for_items
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def purchase_order_item_params
    params[:purchase_order_item].permit(:purchase_order_id, :item_id, :item_type, :qty)
  end

end
