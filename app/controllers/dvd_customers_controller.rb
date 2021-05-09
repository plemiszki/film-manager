class DvdCustomersController < AdminController

  def index
    render 'index', formats: [:html], handlers: [:erb]
  end

  def show
    @dvd_customer = DvdCustomer.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
