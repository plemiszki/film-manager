class Api::JobsController < ApplicationController

  def status
    job = params[:id] ? Job.find(params[:id]) : Job.find_by_job_id(params[:time])
    render json: job
  end

end
