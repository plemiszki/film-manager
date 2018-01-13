class Api::VenuesController < ApplicationController

  def index
    @venues = Venue.all
    render "index.json.jbuilder"
  end

  def show
    @venues = Venue.where(id: params[:id])
    render "show.json.jbuilder"
  end

  def create
    @venue = Venue.new(venue_params)
    if @venue.save
      @venues = Venue.all
      render "index.json.jbuilder"
    else
      render json: @venue.errors.full_messages, status: 422
    end
  end

  # def update
  #   @dvd_customer = DvdCustomer.find(params[:id])
  #   if @dvd_customer.update(dvd_customer_params)
  #     @dvd_customers = DvdCustomer.where(id: params[:id])
  #     render "show.json.jbuilder"
  #   else
  #     render json: @dvd_customer.errors.full_messages, status: 422
  #   end
  # end
  #
  # def destroy
  #   @dvd_customer = DvdCustomer.find(params[:id])
  #   if @dvd_customer.destroy
  #     # TODO: delete all POs? invoices?
  #     render json: @dvd_customer, status: 200
  #   else
  #     render json: @dvd_customer.errors.full_messages, status: 422
  #   end
  # end

  private

  def venue_params
    params[:venue].permit(:label, :sage_id, :venue_type)
  end

end
