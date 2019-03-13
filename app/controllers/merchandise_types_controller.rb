class MerchandiseTypesController < AdminController

  def show
    @merchandise_type = MerchandiseType.find_by(id: params[:id])
    render "show.html.erb"
  end

end
