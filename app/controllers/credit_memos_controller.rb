class CreditMemosController < AdminController

  def index
    render "index.html.erb"
  end

  def show
    @credit_memo = CreditMemo.find_by(id: params[:id])
    render "show.html.erb"
  end

end
