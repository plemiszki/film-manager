class Api::JobsController < ApplicationController

  def status
    job = Job.find_by_job_id(params[:time])
    render json: job
  end

end
