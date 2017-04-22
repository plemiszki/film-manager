class Api::RoyaltyReportsController < ApplicationController

  def show
    query_data_for_show_jbuilder
    render "show.json.jbuilder"
  end

  def update
    error_present = false
    errors = {
      report: [],
      streams: {}
    }
    begin
      ActiveRecord::Base.transaction do
        @report = RoyaltyReport.find(params[:id])
        unless @report.update(report_params)
          error_present = true
          errors[:report] = @report.errors.full_messages
        end
        RoyaltyRevenueStream.where(royalty_report_id: params[:id]).each do |royalty_revenue_stream|
          unless royalty_revenue_stream.update(revenue_stream_params(royalty_revenue_stream.id))
            error_present = true
            errors[:streams][royalty_revenue_stream.id] = royalty_revenue_stream.errors.full_messages
          end
        end
        fail if error_present
        query_data_for_show_jbuilder
        render "show.json.jbuilder"
      end
    rescue
      render json: errors, status: 422
    end
  end

  private

  def query_data_for_show_jbuilder
    @reports = RoyaltyReport.where(id: params[:id])
    @film = Film.find(@reports[0].film_id)
    @streams = RoyaltyRevenueStream.where(royalty_report_id: @reports[0].id)
    calculate(@film, @reports[0], @streams)
  end

  def calculate(film, report, streams)
    report.current_total_revenue = 0.00
    report.current_total_expenses = 0.00 unless film.deal_type_id == 4
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
      report.current_total_expenses += stream.current_expense unless film.deal_type_id == 4
      report.current_total += stream.current_licensor_share

      report.cume_total_revenue += stream.cume_revenue
      report.cume_total_expenses += stream.cume_expense unless film.deal_type_id == 4
      report.cume_total += stream.cume_licensor_share
      report.joined_total_revenue += stream.joined_revenue
      report.joined_total_expenses += stream.joined_expense unless film.deal_type_id == 4
      report.joined_total += stream.joined_licensor_share
      if film.deal_type_id == 4
        report.amount_due = report.cume_total - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
        report.joined_amount_due = report.joined_total - report.current_total_expenses - report.cume_total_expenses - report.e_and_o - report.mg - report.amount_paid
      else
        report.joined_amount_due = report.joined_total - report.e_and_o - report.mg - report.amount_paid
        report.amount_due = report.cume_total - report.e_and_o - report.mg - report.amount_paid
      end
    end
    if film.deal_type_id == 4
      report.current_share_minus_expenses = report.current_total - report.current_total_expenses
      report.joined_total_expenses = report.current_total_expenses + report.cume_total_expenses
    end
  end

  def report_params
    params[:report].permit(:current_total_expenses, :cume_total_expenses, :mg, :e_and_o, :amount_paid)
  end

  def revenue_stream_params(id)
    params[:streams][id.to_s].permit(:current_revenue, :current_expense, :cume_revenue, :cume_expense, :licensor_percentage)
  end

end
