class Api::ReturnsController < AdminController

  include ReturnItems
  include SearchIndex

  def index
    @returns = perform_search(model: 'Return', associations: [:customer, :return_items])
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def new
    @dvd_customers = DvdCustomer.select(:id, :name).order(:name)
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @return = Return.find(params[:id])
    @dvd_customers = DvdCustomer.all.order(:name)
    get_data_for_items
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @return = Return.new(return_params)
    if @return.save
      render 'create', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@return)
    end
  end

  def update
    @return = Return.find(params[:id])
    if @return.update(return_params)
      @returns = Return.where(id: params[:id])
      @dvd_customers = DvdCustomer.all.order(:name)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@return)
    end
  end

  def destroy
    @return = Return.find(params[:id])
    if @return.destroy
      render json: @return, status: 200
    else
      render_errors(@return)
    end
  end

  def export
    return_ids = perform_search(model: 'Return').pluck(:id)
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "export returns", first_line: "Exporting DVD Returns", second_line: true, current_value: 0, total_value: return_ids.length)
    ExportDvdReturns.perform_async(return_ids, time_started)
    render json: { job: job.render_json }
  end

  def send_credit_memo
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: 'send credit memo', first_line: 'Generating Credit Memo', second_line: false)
    GenerateAndSendCreditMemo.perform_async(time_started, params[:id], current_user.id)
    render json: { job: job.render_json }
  end

  private

  def return_params
    params[:return].permit(:date, :number, :customer_id, :month, :year)
  end

end
