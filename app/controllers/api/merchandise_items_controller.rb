class Api::MerchandiseItemsController < AdminController

  def index
    @merchandise_items, @merchandise_types, @films = fetch_data_for_index_view
    render "index.json.jbuilder"
  end

  def show
    @merchandise_items = MerchandiseItem.where(id: params[:id])
    @merchandise_items, @merchandise_types, @films = fetch_data_for_index_view
    render "index.json.jbuilder"
  end

  def create
    @merchandise_item = MerchandiseItem.new(merchandise_item_params)
    if @merchandise_item.save
      @merchandise_items, @merchandise_types, @films = fetch_data_for_index_view
      render "index.json.jbuilder"
    else
      render json: @merchandise_item.errors.full_messages, status: 422
    end
  end

  def update
    @merchandise_item = MerchandiseItem.find(params[:id])
    if @merchandise_item.update(merchandise_item_params)
      @merchandise_items, @merchandise_types, @films = fetch_data_for_index_view
      render "index.json.jbuilder"
    else
      render json: @merchandise_item.errors.full_messages, status: 422
    end
  end

  def destroy
    @merchandise_item = MerchandiseItem.find(params[:id])
    if @merchandise_item.destroy
      render json: @merchandise_item, status: 200
    else
      render json: @merchandise_item.errors.full_messages, status: 422
    end
  end

  private

  def fetch_data_for_index_view
    merchandise_items = @merchandise_items || MerchandiseItem.all
    [merchandise_items, MerchandiseType.all, Film.all]
  end

  def merchandise_item_params
    params[:merchandise_item].permit(:name, :merchandise_type_id, :description, :size, :price, :inventory, :film_id)
  end

end
