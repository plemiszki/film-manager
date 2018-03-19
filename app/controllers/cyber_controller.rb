class CyberController < ApplicationController

  before_action :verify_cyber_ny_request

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  private

  def verify_cyber_ny_request
    if params[:api_key] != ENV.fetch("CYBER_NY_API_KEY")
      render json: { "message": "you are not authorized to do this" }, status: :unauthorized
    end
  end
end
