class Api::JobsController < AdminController

  def index
    @jobs = Job.where(name: 'export all', status: :running, killed: false)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    job = Job.find(params[:id])
    render json: { job: job.render_json }
  end

  def update
    job = Job.find(params[:id])
    job.update(job_params)
    @jobs = Job.where(name: 'export all', status: :running, killed: false)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def job_params
    params[:job].permit(:killed)
  end

end
