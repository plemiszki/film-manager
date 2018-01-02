class Api::ReturnsController < ApplicationController

  include ReturnItems

  def index
    @returns = Return.all.includes(:customer)
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
      @returns = Return.all.includes(:customer)
      @dvd_customers = DvdCustomer.all
      render "index.json.jbuilder"
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

  private

  def return_params
    params[:return].permit(:date, :number, :customer_id, :month, :year)
  end

end
