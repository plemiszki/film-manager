class AliasesController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @alias = Alias.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
