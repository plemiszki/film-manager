class Api::InstitutionsController < AdminController

  def index
    @institutions = Institution.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @institution = Institution.find(params[:id])
    @orders = InstitutionOrder.where(institution: @institution)
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @institution = Institution.new(institution_params)
    if @institution.save
      @institutions = Institution.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution)
    end
  end

  def update
    @institution = Institution.find(params[:id])
    if @institution.update(institution_params.merge({
      billing_address_1: institution_params[:billing_address1],
      billing_address_2: institution_params[:billing_address2],
      shipping_address_1: institution_params[:shipping_address1],
      shipping_address_2: institution_params[:shipping_address2],
    }).except(:billing_address1, :billing_address2, :shipping_address1, :shipping_address2))
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution)
    end
  end

  def destroy
    @institution = Institution.find(params[:id])
    if @institution.destroy
      render json: @institution, status: 200
    else
      render_errors(@institution)
    end
  end

  private

  def institution_params
    params[:institution].permit(
      :label,
      :sage_id,
      :contact_name,
      :email,
      :phone,
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
      :notes,
      :use_stripe,
    )
  end

end
