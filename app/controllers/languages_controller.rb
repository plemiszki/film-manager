class LanguagesController < AdminController

  def show
    @language = Language.find_by(id: params[:id])
    render "show.html.erb"
  end

end
