class QuotesController < AdminController

  def show
    @quote = Quote.find_by(id: params[:id])
    render "show.html.erb"
  end

end
