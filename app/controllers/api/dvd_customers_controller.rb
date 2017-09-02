class Api::DvdCustomersController < ApplicationController

  def index
    @dvd_customers = DvdCustomer.all
    render "index.json.jbuilder"
  end

  def show
    @dvd_customers = DvdCustomer.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @dvd_customer = DvdCustomer.new(name: dvd_customer_params[:name], discount: dvd_customer_params[:discount])
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
    @licensor = Licensor.find(params[:id])
    if @licensor.destroy
      Film.where(licensor_id: params[:id]).update_all(licensor_id: nil)
      render json: @licensor, status: 200
    else
      render json: @licensor.errors.full_messages, status: 422
    end
  end

  private

  def dvd_customer_params
    params[:dvd_customer].permit(:name, :discount, :consignment, :address, :notes)
  end

end
