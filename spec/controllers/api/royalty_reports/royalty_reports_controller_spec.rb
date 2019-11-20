require 'rails_helper'

RSpec.describe Api::RoyaltyReportsController do

  before(:each) do
    set_up
    create(:no_expenses_recouped_film)
    create(:no_expenses_recouped_royalty_report)
    FilmRevenuePercentage.where(film_id: Film.last.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
      RoyaltyRevenueStream.create(royalty_report_id: RoyaltyReport.last.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: 0, cume_expense: 0)
    end
    create(:expenses_recouped_from_top_film)
    create(:expenses_recouped_from_top_royalty_report)
    FilmRevenuePercentage.where(film_id: Film.last.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
      RoyaltyRevenueStream.create(royalty_report_id: RoyaltyReport.last.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: 0, cume_expense: 0)
    end
    create(:theatrical_expenses_recouped_from_top_film)
    create(:theatrical_expenses_recouped_from_top_royalty_report)
    FilmRevenuePercentage.where(film_id: Film.last.id).joins(:revenue_stream).order('revenue_streams.order').each_with_index do |film_revenue_percentage, index|
      RoyaltyRevenueStream.create(royalty_report_id: RoyaltyReport.last.id, revenue_stream_id: film_revenue_percentage.revenue_stream_id, licensor_percentage: film_revenue_percentage.value, cume_revenue: 0, cume_expense: 0)
    end
    sign_in_as(User.first)
  end

  context '#show' do

    it 'returns an OK status code' do
      get :show, id: RoyaltyReport.last.id
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

  end

  context '#update' do

    it 'updates the report' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 0, current_expense: 0 }
      end
      post :update, id: report.id, report: { mg: 300, e_and_o: 400, amount_paid: 500 }, streams: streams
      report.reload
      expect(report.mg).to eq(300)
      expect(report.e_and_o).to eq(400)
      expect(report.amount_paid).to eq(500)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'catches invalid report properties' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      post :update, id: report.id, report: { mg: 'barf' }
      expect(JSON.parse(response.body)["reportErrors"]).to include("Mg is not a number")
      expect(response.status).to eq(422)
    end

    it 'updates report streams (No Expenses Recouped)' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { licensor_percentage: 50, current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, id: report.id, report: {}, streams: streams
      stream = report.reload.royalty_revenue_streams.first
      expect(stream.current_revenue).to eq(100)
      expect(stream.current_expense).to eq(50)
      expect(stream.current_licensor_share).to eq(50)
      expect(stream.cume_revenue).to eq(1000)
      expect(stream.cume_expense).to eq(500)
      expect(stream.cume_licensor_share).to eq(500)
      expect(stream.joined_licensor_share).to eq(550)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'catches invalid report streams' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 'poop' }
      end
      post :update, id: report.id, report: {}, streams: streams
      expect(JSON.parse(response.body)["streamErrors"][report.royalty_revenue_streams.first.id.to_s]).to include("Current revenue is not a number")
      expect(response.status).to eq(422)
    end

    it 'calculates the current total revenue properly when updated' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.current_total_revenue).to eq(1400)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (No Expenses Recouped)' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, licensor_percentage: 50 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.current_total).to eq(700)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total revenue properly when updated' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.cume_total_revenue).to eq(14000)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (No Expenses Recouped)' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000, licensor_percentage: 25 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.cume_total).to eq(3500)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (No Expenses Recouped)' do
      report = Film.where(deal_type_id: 1).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000, licensor_percentage: 50 }
      end
      post :update, id: report.id, report: { amount_paid: 1000, mg: 2000, e_and_o: 2000 }, streams: streams
      report.reload
      expect(report.current_total).to eq(700)
      expect(report.cume_total).to eq(7000)
      expect(report.joined_total).to eq(7700)
      expect(report.joined_amount_due).to eq(2700)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'updates report streams (Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { licensor_percentage: 50, current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, id: report.id, report: {}, streams: streams
      stream = report.reload.royalty_revenue_streams.first
      expect(stream.current_revenue).to eq(100)
      expect(stream.current_expense).to eq(50)
      expect(stream.current_difference).to eq(50)
      expect(stream.current_licensor_share).to eq(25)
      expect(stream.cume_revenue).to eq(1000)
      expect(stream.cume_expense).to eq(500)
      expect(stream.cume_difference).to eq(500)
      expect(stream.cume_licensor_share).to eq(250)
      expect(stream.joined_licensor_share).to eq(275)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the current total expenses properly when updated' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_expense: 70 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.current_total_expenses).to eq(980)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, licensor_percentage: 50 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.current_total).to eq(350)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total revenue properly when updated' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_expense: 800 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.cume_total_expenses).to eq(11_200)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000, cume_expense: 250, licensor_percentage: 40 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.cume_total).to eq(4200)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 2).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 25, cume_revenue: 1000, cume_expense: 200, licensor_percentage: 40 }
      end
      post :update, id: report.id, report: { amount_paid: 400, mg: 500, e_and_o: 2000 }, streams: streams
      report.reload
      expect(report.current_total).to eq(420)
      expect(report.cume_total).to eq(4480)
      expect(report.joined_total).to eq(4900)
      expect(report.joined_amount_due).to eq(2000)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'updates report streams (Theatrical Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 3).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { licensor_percentage: 50, current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, id: report.id, report: {}, streams: streams
      theatrical_stream = report.reload.royalty_revenue_streams.first
      expect(theatrical_stream.current_revenue).to eq(100)
      expect(theatrical_stream.current_expense).to eq(50)
      expect(theatrical_stream.current_difference).to eq(50)
      expect(theatrical_stream.current_licensor_share).to eq(25)
      expect(theatrical_stream.cume_revenue).to eq(1000)
      expect(theatrical_stream.cume_expense).to eq(500)
      expect(theatrical_stream.cume_difference).to eq(500)
      expect(theatrical_stream.cume_licensor_share).to eq(250)
      expect(theatrical_stream.joined_licensor_share).to eq(275)
      video_stream = report.reload.royalty_revenue_streams.third
      expect(video_stream.current_revenue).to eq(100)
      expect(video_stream.current_expense).to eq(50)
      expect(video_stream.current_difference).to eq(100)
      expect(video_stream.current_licensor_share).to eq(50)
      expect(video_stream.cume_revenue).to eq(1000)
      expect(video_stream.cume_expense).to eq(500)
      expect(video_stream.cume_difference).to eq(1000)
      expect(video_stream.cume_licensor_share).to eq(500)
      expect(video_stream.joined_licensor_share).to eq(550)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (Theatrical Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 3).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, licensor_percentage: 50 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.current_total).to eq(625)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (Theatrical Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 3).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000, cume_expense: 250, licensor_percentage: 40 }
      end
      post :update, id: report.id, report: {}, streams: streams
      report.reload
      expect(report.cume_total).to eq(5300)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (Theatrical Expenses Recouped From Top)' do
      report = Film.where(deal_type_id: 3).first.royalty_reports.first
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 25, cume_revenue: 1000, cume_expense: 200, licensor_percentage: 40 }
      end
      post :update, id: report.id, report: { amount_paid: 400, mg: 500, e_and_o: 2000 }, streams: streams
      report.reload
      expect(report.current_total).to eq(530)
      expect(report.cume_total).to eq(5360)
      expect(report.joined_total).to eq(5890)
      expect(report.joined_amount_due).to eq(2990)
      expect(response).to render_template('api/royalty_reports/show.json.jbuilder')
      expect(response.status).to eq(200)
    end

  end

  context '#export' do

    it 'returns an OK status code' do
      get :export, id: RoyaltyReport.last.id
      expect(response.status).to eq(200)
    end

  end

end
