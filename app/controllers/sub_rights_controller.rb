class SubRightsController < AdminController

  def show
    @sub_right = SubRight.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
