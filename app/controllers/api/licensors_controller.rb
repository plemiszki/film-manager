class Api::LicensorsController < AdminController

  def index
    @licensors = Licensor.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @licensor = Licensor.find(params[:id])
    @films = Film.where(licensor_id: params[:id]).order(:title)
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @licensor = Licensor.new(name: licensor_params[:name], email: "", address: "")
    if @licensor.save
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@licensor)
    end
  end

  def update
    @licensor = Licensor.find(params[:id])
    @films = Film.where(licensor_id: params[:id]).order(:title)
    if @licensor.update(licensor_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@licensor)
    end
  end

  def destroy
    @licensor = Licensor.find(params[:id])
    if @licensor.destroy
      Film.where(licensor_id: params[:id]).update_all(licensor_id: nil)
      render json: @licensor, status: 200
    else
      render_errors(@licensor)
    end
  end

  def generate_statements_summary
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "generate statements summary", first_line: "Generating Statements Summary", second_line: false)
    GenerateStatementsSummary.perform_async(0, {
      time_started: time_started,
      licensor_id: params[:id],
    }.stringify_keys)
    render json: { job: job.render_json }
  end

  private

  def licensor_params
    params[:licensor].permit(:name, :email, :address, :sage_id)
  end

end
