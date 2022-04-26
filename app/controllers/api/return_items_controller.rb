class Api::ReturnItemsController < AdminController

  include ReturnItems
  include Reorderable

  def create
    customer = DvdCustomer.find(Return.find(return_item_params[:return_id]).customer_id)
    amount = Invoice.get_item_price(return_item_params[:item_id], return_item_params[:item_type], customer).to_f * return_item_params[:qty].to_i
    current_length = ReturnItem.where(return_id: return_item_params[:return_id]).length
    @return_item = ReturnItem.new(return_id: return_item_params[:return_id], item_id: return_item_params[:item_id], item_type: return_item_params[:item_type], qty: return_item_params[:qty], order: current_length, amount: amount)
    if @return_item.save
      @return = Return.find(@return_item.return_id)
      get_data_for_items
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@return_item)
    end
  end

  def destroy
    @return_item = ReturnItem.find(params[:id])
    @return_item.destroy
    reorder(ReturnItem.where(return_id: @return_item.return_id).order(:order))
    @return = Return.find(@return_item.return_id)
    get_data_for_items
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def return_item_params
    params[:return_item].permit(:return_id, :item_id, :item_type, :qty)
  end

end
