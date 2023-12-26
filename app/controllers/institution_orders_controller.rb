class InstitutionOrdersController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @institution_order = InstitutionOrder.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
