class Api::ReturnsController < AdminController

  include ReturnItems

  def index
    @returns = Return.all.includes(:customer, :return_items)
    @dvd_customers = DvdCustomer.all
    render "index.json.jbuilder"
  end

  def show
    @returns = Return.where(id: params[:id])
    @dvd_customers = DvdCustomer.all
    get_data_for_items
    render "show.json.jbuilder"
  end

  def create
    @return = Return.new(return_params)
    if @return.save
      render "create.json.jbuilder"
    else
      render json: @return.errors.full_messages, status: 422
    end
  end

  def update
    @return = Return.find(params[:id])
    if @return.update(return_params)
      @returns = Return.where(id: params[:id])
      @dvd_customers = DvdCustomer.all
      render "show.json.jbuilder"
    else
      render json: @return.errors.full_messages, status: 422
    end
  end

  def destroy
    @return = Return.find(params[:id])
    if @return.destroy
      render json: @return, status: 200
    else
      render json: @return.errors.full_messages, status: 422
    end
  end

  def export
    start_date = Date.strptime(params[:start_date], "%m/%d/%y")
    end_date = Date.strptime(params[:end_date], "%m/%d/%y")
    time_started = Time.now.to_s
    total_returns = Return.where(date: start_date..end_date).count
    job = Job.create!(job_id: time_started, name: "export returns", first_line: "Exporting DVD Returns", second_line: true, current_value: 0, total_value: total_returns)
    ExportDvdReturns.perform_async(time_started, start_date, end_date)
    render json: job
  end

  private

  def return_params
    params[:return].permit(:date, :number, :customer_id, :month, :year)
  end

end
