class Api::InstitutionOrdersController < AdminController

  def index
    @institution_orders = InstitutionOrder.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @institution_order = InstitutionOrder.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @institution_order = InstitutionOrder.new(institution_order_params)
    if @institution_order.save
      @institution_orders = InstitutionOrder.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution_order)
    end
  end

  def update
    @institution_order = InstitutionOrder.find(params[:id])
    if @institution_order.update(institution_order_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution_order)
    end
  end

  def destroy
    @institution_order = InstitutionOrder.find(params[:id])
    if @institution_order.destroy
      render json: @institution_order, status: 200
    else
      render_errors(@institution_order)
    end
  end

  private

  def institution_order_params
    params[:institution_order].permit(
      :institution_id,
      :order_date,
      :number,
      :billing_name,
      :billing_address1,
      :billing_address2,
      :billing_city,
      :billing_state,
      :billing_zip,
      :billing_country,
      :shipping_name,
      :shipping_address1,
      :shipping_address2,
      :shipping_city,
      :shipping_state,
      :shipping_zip,
      :shipping_country,
      :shipping_fee,
      :materials_sent,
      :tracking_number,
      :delivered,
      :notes,
    )
  end

end
