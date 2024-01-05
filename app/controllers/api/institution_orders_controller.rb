class Api::InstitutionOrdersController < AdminController

  def index
    @institution_orders = InstitutionOrder.all.includes(:institution)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def new
    @institutions = Institution.all
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @institution_order = InstitutionOrder.find(params[:id])
    @institutions = Institution.all
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @institution_order = InstitutionOrder.new(institution_order_params)
    if @institution_order.save
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution_order)
    end
  end

  def update
    @institution_order = InstitutionOrder.find(params[:id])
    if @institution_order.update(institution_order_params.merge({
      billing_address_1: institution_order_params[:billing_address1],
      billing_address_2: institution_order_params[:billing_address2],
      shipping_address_1: institution_order_params[:shipping_address1],
      shipping_address_2: institution_order_params[:shipping_address2],
    }).except(:billing_address1, :billing_address2, :shipping_address1, :shipping_address2))
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
      :number,
      :order_date,
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
      :licensed_rights,
      :price,
      :shipping_fee,
      :materials_sent,
      :tracking_number,
      :notes,
    )
  end

end
