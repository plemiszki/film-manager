class Api::JobsController < AdminController

  def status
    job = params[:id] ? Job.find(params[:id]) : Job.find_by_job_id(params[:time])
    render json: job
  end

  def index
    @jobs = Job.where(name: 'export all', done: false, killed: false)
    render 'index.json.jbuilder'
  end

  def update
    job = Job.find(params[:id])
    job.update(job_params)
    @jobs = Job.where(name: 'export all', done: false, killed: false)
    render 'index.json.jbuilder'
  end

  private

  def job_params
    params[:job].permit(:killed)
  end

end
