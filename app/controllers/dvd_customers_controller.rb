class DvdCustomersController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @dvd_customer = DvdCustomer.find_by(id: params[:id])
    render "show.html.erb"
  end

end
