class FormatsController < AdminController

  def show
    @format = Format.find_by(id: params[:id])
    render "show.html.erb"
  end

end
