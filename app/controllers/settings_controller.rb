class SettingsController < AdminController

  def show
    render 'show', formats: [:html], handlers: [:erb]
  end

end
