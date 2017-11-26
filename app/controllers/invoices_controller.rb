class InvoicesController < ApplicationController

  def index
    render "index.html.erb"
  end

  def show
    @invoice = Invoice.find_by(id: params[:id])
    render "show.html.erb"
  end

end
