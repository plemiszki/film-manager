class Api::CreditMemosController < AdminController

  include ActionView::Helpers::NumberHelper
  include ApplicationHelper
  include SearchIndex

  def index
    @credit_memos = perform_search(model: 'CreditMemo', associations: ['customer'])
    render "index.json.jbuilder"
  end

  def new
    @customers = DvdCustomer.all.order(:name)
    render "new.json.jbuilder"
  end

  def show
    @credit_memo = CreditMemo.find(params[:id])
    @rows = @credit_memo.credit_memo_rows
    render 'show.json.jbuilder'
  end

  def export
    credit_memo_ids = perform_search(model: 'CreditMemo').pluck(:id)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export credit memos", first_line: "Exporting Credit Memos", second_line: true, current_value: 0, total_value: credit_memo_ids.length)
    ExportCreditMemos.perform_async(credit_memo_ids, time_started)
    render json: { job: job.render_json }
  end

end
