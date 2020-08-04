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

  def export_sage
    credit_memo_ids = params[:credit_memo_ids].to_a.map(&:to_i)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export credit memos", first_line: "Exporting Credit Memos", second_line: true, current_value: 0, total_value: credit_memo_ids.length)
    ExportCreditMemos.perform_async(credit_memo_ids, time_started)
    render json: { job: job }
  end

end
