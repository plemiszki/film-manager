class Api::DvdCustomersController < AdminController

  def index
    @dvd_customers = DvdCustomer.all
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @dvd_customer = DvdCustomer.find(params[:id])
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @dvd_customer = DvdCustomer.new(dvd_customer_params)
    if @dvd_customer.save
      @dvd_customers = DvdCustomer.all
      render 'index', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@dvd_customer)
    end
  end

  def update
    @dvd_customer = DvdCustomer.find(params[:id])
    if @dvd_customer.update(dvd_customer_params)
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@dvd_customer)
    end
  end

  def destroy
    @dvd_customer = DvdCustomer.find(params[:id])
    if @dvd_customer.destroy
      # TODO: delete all POs? invoices?
      render json: @dvd_customer, status: 200
    else
      render_errors(@dvd_customer)
    end
  end

  def create_in_stripe
    dvd_customer = DvdCustomer.find(params[:id])
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "create stripe customer", first_line: "Creating Stripe Customer", second_line: false)
    CreateStripeCustomer.perform_async(time_started, dvd_customer.get_first_invoices_email)
    render json: { job: job.render_json }
  end

  private

  def dvd_customer_params
    result = params[:dvd_customer].permit(
      :name,
      :discount,
      :consignment,
      :notes,
      :sage_id,
      :invoices_email,
      :credit_memo_email,
      :payment_terms,
      :billing_name,
      :address1,
      :address2,
      :city,
      :state,
      :zip,
      :country,
      :include_in_title_report,
      :nickname,
      :use_stripe,
    )
    if result[:discount].to_s.gsub(' ', '').include?("/unit")
      result[:per_unit] = result[:discount].gsub(/[^\d.]/, '')
      result.delete(:discount)
    end
    result
  end

end
