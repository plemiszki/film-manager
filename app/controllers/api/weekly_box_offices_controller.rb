class Api::WeeklyBoxOfficesController < ApplicationController

  include Reorderable

  def create
    current_length = WeeklyBoxOffice.where(booking_id: weekly_box_office_params[:booking_id]).length
    @weekly_box_office = WeeklyBoxOffice.new(booking_id: weekly_box_office_params[:booking_id], order: current_length, amount: weekly_box_office_params[:amount])
    if @weekly_box_office.save
      @weekly_box_offices = WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id)
      render 'index.json.jbuilder'
    else
      render json: @weekly_box_office.errors.full_messages, status: 422
    end
  end

  def destroy
    @weekly_box_office = WeeklyBoxOffice.find(params[:id])
    @weekly_box_office.destroy
    reorder(WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id).order(:order))
    @weekly_box_offices = WeeklyBoxOffice.where(booking_id: @weekly_box_office.booking_id)
    render 'index.json.jbuilder'
  end

  private

  def weekly_box_office_params
    params[:weekly_box_office].permit(:booking_id, :order, :amount)
  end

end
