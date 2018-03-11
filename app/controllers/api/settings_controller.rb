class Api::SettingsController < ApplicationController

  def show
    @settings = Setting.first
    render "show.json.jbuilder"
  end

  def update
    @settings = Setting.first
    if @settings.update(settings_params)
      render "show.json.jbuilder"
    else
      render json: @settings.errors.full_messages, status: 422
    end
  end

  private

  def settings_params
    params[:settings].permit(:booking_confirmation_text)
  end

end
