class Api::InstitutionOrderFormatsController < AdminController

  def create
    institution_order_format = InstitutionOrderFormat.new(institution_order_format_params)
    if institution_order_format.save!
      @institution_order_formats = institution_order_format.order.institution_order_formats.includes(:format)
      @formats = Format.where.not(id: @institution_order_formats.pluck(:format_id))
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render json: institution_order_format.errors.full_messages, status: 422
    end
  end

  def destroy
    institution_order_format = InstitutionOrderFormat.find(params[:id]).destroy
    @institution_order_formats = institution_order_format.order.institution_order_formats.includes(:format)
    @formats = Format.where.not(id: @institution_order_formats.pluck(:format_id))
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def institution_order_format_params
    params.require(:institution_order_format).permit(:format_id, :institution_order_id)
  end

end
