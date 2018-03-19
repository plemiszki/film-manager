class Api::DvdCustomersController < AdminController

  def index
    @dvd_customers = DvdCustomer.all
    render "index.json.jbuilder"
  end

  def show
    @dvd_customers = DvdCustomer.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @dvd_customer = DvdCustomer.new(dvd_customer_params)
    if @dvd_customer.save
      @dvd_customers = DvdCustomer.all
      render "index.json.jbuilder"
    else
      render json: @dvd_customer.errors.full_messages, status: 422
    end
  end

  def update
    @dvd_customer = DvdCustomer.find(params[:id])
    if @dvd_customer.update(dvd_customer_params)
      @dvd_customers = DvdCustomer.where(id: params[:id])
      render "show.json.jbuilder"
    else
      render json: @dvd_customer.errors.full_messages, status: 422
    end
  end

  def destroy
    @dvd_customer = DvdCustomer.find(params[:id])
    if @dvd_customer.destroy
      # TODO: delete all POs? invoices?
      render json: @dvd_customer, status: 200
    else
      render json: @dvd_customer.errors.full_messages, status: 422
    end
  end

  private

  def dvd_customer_params
    result = params[:dvd_customer].permit(:name, :discount, :consignment, :notes, :sage_id, :invoices_email, :payment_terms, :billing_name, :address1, :address2, :city, :state, :zip, :country)
    if result[:discount].gsub(' ', '').include?("/unit")
      result[:per_unit] = result[:discount].gsub(/[^\d.]/, '')
      result.delete(:discount)
    end
    result
  end

end
