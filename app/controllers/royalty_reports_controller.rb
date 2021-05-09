class RoyaltyReportsController < AdminController

  before_action :redirect_unless_super_admin

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @royalty_report = RoyaltyReport.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

  private

  def redirect_unless_super_admin
    redirect_to "/" unless current_user.access == "super_admin"
  end

end
