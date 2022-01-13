class CalendarController < ApplicationController

  def show
    render 'show', formats: [:html], handlers: [:erb]
  end

end
