class ApplicationController < ActionController::Base

  include Clearance::Controller

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  private

  def valid_api_key?(env_key)
    ActiveSupport::SecurityUtils.secure_compare(params[:api_key].to_s, ENV.fetch(env_key))
  end
end
