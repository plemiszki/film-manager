class RoyaltyReportsController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @royalty_report = RoyaltyReport.find_by(id: params[:id])
    render "show.html.erb"
  end

end