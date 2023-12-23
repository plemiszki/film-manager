class Api::InstitutionsController < AdminController

  def index
    @institutions = Institution.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @institution = Institution.find(params[:id])
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
    if @institution.update(institution_params)
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
    params[:institution].permit(:label)
  end

end
