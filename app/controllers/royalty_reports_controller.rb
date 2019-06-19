class RoyaltyReportsController < AdminController

  before_action :redirect_unless_super_admin

  def index
    render "index.html.erb"
  end

  def show
    @royalty_report = RoyaltyReport.find_by(id: params[:id])
    render "show.html.erb"
  end

  private

  def redirect_unless_super_admin
    redirect_to "/" unless current_user.access == "super_admin"
  end

end
