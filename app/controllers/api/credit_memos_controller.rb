class Api::CreditMemosController < AdminController

  include ActionView::Helpers::NumberHelper
  include ApplicationHelper

  def index
    @credit_memos = CreditMemo.all.order('id DESC').includes(:customer)
    @credit_memos = @credit_memos.limit(100) unless params[:all]
    render "index.json.jbuilder"
  end

  def show
    @credit_memo = CreditMemo.find(params[:id])
    @rows = @credit_memo.credit_memo_rows
    render 'show.json.jbuilder'
  end

end
