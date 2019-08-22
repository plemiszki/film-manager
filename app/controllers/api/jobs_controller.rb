class Api::JobsController < AdminController

  def status
    job = params[:id] ? Job.find(params[:id]) : Job.find_by_job_id(params[:time])
    render json: job
  end

  def index
    @jobs = Job.where(name: 'export all', done: false)
    render 'index.json.jbuilder'
  end

end
