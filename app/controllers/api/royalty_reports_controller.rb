class Api::RoyaltyReportsController < ApplicationController

  def show
    @reports = RoyaltyReport.where(id: params[:id])
    @film = Film.find(@reports[0].film_id)
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id)
    calculate(@film, @reports[0], @streams)
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

  # def update
  #   error_present = false
  #   errors = {
  #     film: [],
  #     percentages: {}
  #   }
  #   begin
  #     ActiveRecord::Base.transaction do
  #       @film = Film.find(params[:id])
  #       unless @film.update(film_params)
  #         error_present = true
  #         errors[:film] = @film.errors.full_messages
  #       end
  #       FilmRevenuePercentage.where(film_id: params[:id]).each do |revenue_percentage|
  #         unless revenue_percentage.update(value: params[:percentages][revenue_percentage.id.to_s])
  #           error_present = true
  #           errors[:percentages][revenue_percentage.id] = revenue_percentage.errors.full_messages
  #         end
  #       end
  #       fail if error_present
  #       @films = Film.where(id: params[:id])
  #       @film_revenue_percentages = FilmRevenuePercentage.where(film_id: params[:id])
  #       render "show.json.jbuilder"
  #     end
  #   rescue
  #     render json: errors, status: 422
  #   end
  # end
  #
  # def destroy
  #   @film = Film.find(params[:id])
  #   if @film.destroy
  #     render json: @film, status: 200
  #   else
  #     render json: @film.errors.full_messages, status: 422
  #   end
  # end

  private

  def calculate(film, report, streams)
    report.current_total_revenue = 0.00
    report.current_total_expenses = 0.00
    report.current_total = 0.00
    streams.each do |stream|
      stream.joined_revenue = stream.current_revenue + stream.cume_revenue
      stream.joined_expense = stream.current_expense + stream.cume_expense
      if film.deal_type_id == 1 # No Expenses Recouped
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 2 # Expenses Recouped From Top
        stream.current_difference = stream.current_revenue - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 3 # Theatrical Expenses Recouped From Top
        if ["Theatrical", "Non-Theatrical", "Commercial Video"].include?(stream.revenue_stream.name)
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
        else
          stream.current_difference = stream.current_revenue
          stream.cume_difference = stream.cume_revenue
          stream.joined_difference = stream.joined_revenue
        end
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 4 # Expenses Recouped From Licensor Share
        stream.current_licensor_share = (stream.current_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_licensor_share = (stream.cume_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_licensor_share = (stream.joined_revenue * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 5 # GR Percentage
        stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
        stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
        stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
        stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
        stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
      elsif film.deal_type_id == 6 # GR Percentage Theatrical/Non-Theatrical
        if ["Theatrical", "Non-Theatrical"].include?(stream.revenue_stream.name)
          stream.current_gr = (stream.current_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.current_difference = stream.current_revenue - stream.current_gr - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_gr = (stream.cume_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_gr - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_gr = (stream.joined_revenue * (film.gr_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_gr - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        else
          stream.current_difference = stream.current_revenue - stream.current_expense
          stream.current_licensor_share = (stream.current_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.cume_difference = stream.cume_revenue - stream.cume_expense
          stream.cume_licensor_share = (stream.cume_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
          stream.joined_difference = stream.joined_revenue - stream.joined_expense
          stream.joined_licensor_share = (stream.joined_difference * (stream.licensor_percentage.fdiv(100))).truncate(2)
        end
      end

      report.current_total_revenue += stream.current_revenue
      report.current_total_expenses += stream.current_expense
      report.current_total += stream.current_licensor_share
    end
  end

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
      :title
    )
    result[:licensor_id] = nil unless params[:film][:licensor_id]
    result
  end

end
