class Api::ExternalController < ApplicationController

  before_action :verify_justwatch_request, only: [:justwatch]
  before_action :verify_samsung_request, only: [:samsung]

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  def justwatch
    @films = Film.where.not(fm_plus_url: '').order(:title).includes(:film_rights, :directors, :languages)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def samsung
    @films = Film.features.not_expired.order(:title).includes(:directors, :actors, :languages, :countries)
    render 'samsung', formats: [:json], handlers: [:jbuilder]
  end

  private

  def verify_justwatch_request
    if params[:api_key] != ENV.fetch("JUSTWATCH_API_KEY")
      render json: { "message": "you are not authorized to do this" }, status: :unauthorized
    end
  end

  def verify_samsung_request
    if params[:api_key] != ENV.fetch("SAMSUNG_API_KEY")
      render json: { "message": "you are not authorized to do this" }, status: :unauthorized
    end
  end

end
