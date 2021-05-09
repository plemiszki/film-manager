class CountriesController < AdminController

  def show
    @country = Country.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
