class Api::FilmsController < ApplicationController

  def index
    @films = Film.where(short_film: params[:shorts])
    render "index.json.jbuilder"
  end

  def show
    @films = Film.where(id: params[:id])
    @templates = DealTemplate.all
    @licensors = Licensor.all
    @revenue_streams = RevenueStream.all
    @reports = RoyaltyReport.where(film_id: params[:id])
    @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
    @rights = FilmRight.where(film_id: params[:id])
    @dvds = Dvd.where(feature_film_id: params[:id])
    @dvd_types = DvdType.where.not(id: @dvds.pluck(:dvd_type_id))
    render "show.json.jbuilder"
  end

  def create
    @film = Film.new(title: film_params[:title], label_id: 1, days_statement_due: 30, short_film: params[:short])
    if @film.save
      @films = Film.where(short_film: params[:short])
      render "index.json.jbuilder"
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  def update
    error_present = false
    errors = {
      film: [],
      percentages: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @film = Film.find(params[:id])
        unless @film.update(film_params)
          error_present = true
          errors[:film] = @film.errors.full_messages
        end
        FilmRevenuePercentage.where(film_id: params[:id]).each do |revenue_percentage|
          unless revenue_percentage.update(value: params[:percentages][revenue_percentage.id.to_s])
            error_present = true
            errors[:percentages][revenue_percentage.id] = revenue_percentage.errors.full_messages
          end
        end
        fail if error_present
        @films = Film.where(id: params[:id])
        @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
        @dvds = Dvd.where(feature_film_id: params[:id])
        @dvd_types = DvdType.where.not(id: @dvds.pluck(:dvd_type_id))
        render "show.json.jbuilder"
      end
    rescue
      render json: errors, status: 422
    end
  end

  def destroy
    @film = Film.find(params[:id])
    if @film.destroy
      render json: @film, status: 200
    else
      render json: @film.errors.full_messages, status: 422
    end
  end

  private

  def film_params
    result = params[:film].permit(
      :days_statement_due,
      :deal_type_id,
      :e_and_o,
      :expense_cap,
      :gr_percentage,
      :licensor_id,
      :mg,
      :royalty_notes,
      :sage_id,
      :short_film,
      :title,
      :send_reports,
      :export_reports,
      :reserve,
      :reserve_percentage,
      :reserve_quarters,
      :sell_off_period,
      :auto_renew,
      :auto_renew_term
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

end
