class CountriesController < ApplicationController

  def show
    @country = Country.find_by(id: params[:id])
    render "show.html.erb"
  end

end
