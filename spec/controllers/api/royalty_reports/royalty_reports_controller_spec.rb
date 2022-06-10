require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::RoyaltyReportsController do

  context '#show' do
    render_views

    it 'shows the proper amount due for an uncrossed film' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      report.royalty_revenue_streams.each do |stream|
        stream.update!(current_revenue: 100)
      end
      report.calculate!
      get :show, params: { id: report.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["report"]["joinedAmountDue"]).to eq("-$1,800.00")
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'shows the proper amount due for two crossed films' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      report.royalty_revenue_streams.each do |stream|
        stream.update!(current_revenue: 100)
      end
      report.calculate!
      second_film = create(:no_expenses_recouped_film, title: 'Film 2')
      second_film.film_revenue_percentages.update_all({ value: 50 })
      second_report = create(:no_expenses_recouped_royalty_report, film_id: second_film.id)
      second_report.create_empty_streams!
      second_report.royalty_revenue_streams.each do |stream|
        stream.update!(current_revenue: 100)
      end
      second_report.calculate!
      CrossedFilm.create!(film_id: film.id, crossed_film_id: second_film.id)
      get :show, params: { id: report.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["report"]["joinedAmountDue"]).to eq("-$3,600.00")
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

  end

  context '#update' do

    it 'updates the report' do
      film = create(:no_expenses_recouped_film)
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 0, current_expense: 0 }
      end
      post :update, params: { id: report.id, report: { mg: 300, e_and_o: 400, amount_paid: 500 }, streams: streams }
      report.reload
      expect(report.mg).to eq(300)
      expect(report.e_and_o).to eq(400)
      expect(report.amount_paid).to eq(500)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'catches invalid report properties' do
      film = create(:no_expenses_recouped_film)
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      post :update, params: { id: report.id, report: { mg: 'barf' } }
      expect(JSON.parse(response.body)['errors']['report']['mg']).to include('Mg is not a number')
      expect(response.status).to eq(422)
    end

    it 'updates report streams (No Expenses Recouped)' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      stream = report.reload.royalty_revenue_streams.first
      expect(stream.current_revenue).to eq(100)
      expect(stream.current_expense).to eq(50)
      expect(stream.current_licensor_share).to eq(50)
      expect(stream.cume_revenue).to eq(1000)
      expect(stream.cume_expense).to eq(500)
      expect(stream.cume_licensor_share).to eq(500)
      expect(stream.joined_revenue).to eq(1100)
      expect(stream.joined_expense).to eq(550)
      expect(stream.joined_licensor_share).to eq(550)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'catches invalid report streams' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 'poop' }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      expect(JSON.parse(response.body)['errors'][report.royalty_revenue_streams.first.id.to_s]['currentRevenue']).to include("Current revenue is not a number")
      expect(response.status).to eq(422)
    end

    it 'calculates the current total revenue properly when updated' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total_revenue).to eq(1400)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (No Expenses Recouped)' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(700)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total revenue properly when updated' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total_revenue).to eq(14000)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (No Expenses Recouped)' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 25 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total).to eq(3500)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (No Expenses Recouped)' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:no_expenses_recouped_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: { amount_paid: 1000, mg: 2000, e_and_o: 2000 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(700)
      expect(report.cume_total).to eq(7000)
      expect(report.joined_total).to eq(7700)
      expect(report.joined_amount_due).to eq(2700)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates report streams (Expenses Recouped From Top)' do
      film = create(:expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
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
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the current total expenses properly when updated' do
      film = create(:expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_expense: 70 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total_expenses).to eq(980)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (Expenses Recouped From Top)' do
      film = create(:expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(350)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total expenses properly when updated' do
      film = create(:expenses_recouped_from_top_film)
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_expense: 800 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total_expenses).to eq(11_200)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (Expenses Recouped From Top)' do
      film = create(:expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000, cume_expense: 250 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total).to eq(4200)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (Expenses Recouped From Top)' do
      film = create(:expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 25, cume_revenue: 1000, cume_expense: 200 }
      end
      post :update, params: { id: report.id, report: { amount_paid: 400 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(420)
      expect(report.cume_total).to eq(4480)
      expect(report.joined_total).to eq(4900)
      expect(report.joined_amount_due).to eq(2000)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates report streams (Theatrical Expenses Recouped From Top)' do
      film = create(:theatrical_expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:theatrical_expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
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
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (Theatrical Expenses Recouped From Top)' do
      film = create(:theatrical_expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:theatrical_expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(625)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (Theatrical Expenses Recouped From Top)' do
      film = create(:theatrical_expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:theatrical_expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000, cume_expense: 250 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total).to eq(5300)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (Theatrical Expenses Recouped From Top)' do
      film = create(:theatrical_expenses_recouped_from_top_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:theatrical_expenses_recouped_from_top_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 25, cume_revenue: 1000, cume_expense: 200 }
      end
      post :update, params: { id: report.id, report: { amount_paid: 400 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(530)
      expect(report.cume_total).to eq(5360)
      expect(report.joined_total).to eq(5890)
      expect(report.joined_amount_due).to eq(2990)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates report streams (Expenses Recouped From Licensor Share)' do
      film = create(:expenses_recouped_from_licensor_share_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:expenses_recouped_from_licensor_share_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      stream = report.reload.royalty_revenue_streams.first
      expect(stream.current_revenue).to eq(100)
      expect(stream.current_licensor_share).to eq(50)
      expect(stream.cume_revenue).to eq(1000)
      expect(stream.cume_licensor_share).to eq(500)
      expect(stream.joined_licensor_share).to eq(550)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the current total properly when updated (Expenses Recouped From Licensor Share)' do
      film = create(:expenses_recouped_from_licensor_share_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:expenses_recouped_from_licensor_share_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100 }
      end
      post :update, params: { id: report.id, report: { current_total_expenses: 250, cume_total_expenses: 350 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(700)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the cume total properly when updated (Expenses Recouped From Licensor Share)' do
      film = create(:expenses_recouped_from_licensor_share_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:expenses_recouped_from_licensor_share_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.cume_total).to eq(5600)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the amount due properly when updated (Expenses Recouped From Licensor Share)' do
      film = create(:expenses_recouped_from_licensor_share_film)
      film.film_revenue_percentages.update_all({ value: 40 })
      report = create(:expenses_recouped_from_licensor_share_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: { current_total_expenses: 300, cume_total_expenses: 800, amount_paid: 400 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(560)
      expect(report.current_share_minus_expenses).to eq(260)
      expect(report.cume_total).to eq(5600)
      expect(report.joined_total).to eq(6160)
      expect(report.joined_total_expenses).to eq(1100)
      expect(report.amount_due).to eq(1900)
      expect(report.joined_amount_due).to eq(2160)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates report streams (GR Percentage)' do
      film = create(:gr_percentage_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:gr_percentage_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      stream = report.reload.royalty_revenue_streams.first
      expect(stream.current_revenue).to eq(100)
      expect(stream.current_gr).to eq(20)
      expect(stream.current_licensor_share).to eq(40)
      expect(stream.cume_revenue).to eq(1000)
      expect(stream.cume_gr).to eq(200)
      expect(stream.cume_licensor_share).to eq(400)
      expect(stream.joined_licensor_share).to eq(440)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the report properly when updated (GR Percentage)' do
      film = create(:gr_percentage_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:gr_percentage_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, params: { id: report.id, report: { amount_paid: 400 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(210)
      expect(report.cume_total).to eq(2100)
      expect(report.joined_total).to eq(2310)
      expect(report.amount_due).to eq(-800)
      expect(report.joined_amount_due).to eq(-590)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates report streams (GR Percentage Theatrical/Non-Theatrical)' do
      film = create(:gr_percentage_theatrical_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:gr_percentage_theatrical_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, cume_revenue: 1000 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      theatrical_stream = report.reload.royalty_revenue_streams.first
      expect(theatrical_stream.current_revenue).to eq(100)
      expect(theatrical_stream.current_gr).to eq(20)
      expect(theatrical_stream.current_licensor_share).to eq(40)
      expect(theatrical_stream.cume_revenue).to eq(1000)
      expect(theatrical_stream.cume_gr).to eq(200)
      expect(theatrical_stream.cume_licensor_share).to eq(400)
      expect(theatrical_stream.joined_licensor_share).to eq(440)
      video_stream = report.reload.royalty_revenue_streams.third
      expect(video_stream.current_revenue).to eq(100)
      expect(video_stream.current_gr).to eq(0)
      expect(video_stream.current_licensor_share).to eq(50)
      expect(video_stream.cume_revenue).to eq(1000)
      expect(video_stream.cume_gr).to eq(0)
      expect(video_stream.cume_licensor_share).to eq(500)
      expect(video_stream.joined_licensor_share).to eq(550)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'calculates the report properly when updated (GR Percentage Theatrical/Non-Theatrical)' do
      film = create(:gr_percentage_theatrical_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      report = create(:gr_percentage_theatrical_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50, cume_revenue: 1000, cume_expense: 500 }
      end
      post :update, params: { id: report.id, report: { amount_paid: 400 }, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(330)
      expect(report.cume_total).to eq(3300)
      expect(report.joined_total).to eq(3630)
      expect(report.amount_due).to eq(400)
      expect(report.joined_amount_due).to eq(730)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end

    it 'updates future reports properly' do
      film = create(:no_expenses_recouped_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      # first quarter
      q1_report = create(:no_expenses_recouped_royalty_report)
      q1_report.create_empty_streams!
      streams = {}
      q1_report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100 }
      end
      post :update, params: { id: q1_report.id, report: {}, streams: streams }, as: :json
      q1_report.reload
      expect(q1_report.current_total).to eq(700)
      expect(q1_report.joined_amount_due).to eq(-1800)
      # second quarter
      q2_report = create(:no_expenses_recouped_royalty_report, quarter: 2)
      q2_report.create_empty_streams!
      q2_report.transfer_and_calculate_from_previous_report!
      expect(q2_report.cume_total).to eq(700)
      expect(q2_report.amount_due).to eq(-1800)
      streams = {}
      q2_report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 200 }
      end
      post :update, params: { id: q2_report.id, report: {}, streams: streams }, as: :json
      q2_report.reload
      expect(q2_report.current_total).to eq(1400)
      expect(q2_report.cume_total).to eq(700)
      expect(q2_report.joined_amount_due).to eq(-400)
      # update first quarter
      streams = {}
      q1_report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 150 }
      end
      post :update, params: { id: q1_report.id, report: {}, streams: streams }, as: :json
      q1_report.reload
      expect(q1_report.current_total).to eq(1050)
      expect(q1_report.joined_amount_due).to eq(-1450)
      q2_report.reload
      q2_report.royalty_revenue_streams.each do |stream|
        expect(stream.cume_revenue).to eq(150)
      end
      expect(q2_report.current_total).to eq(1400)
      expect(q2_report.cume_total).to eq(1050)
      expect(q2_report.joined_amount_due).to eq(-50)
    end

    it 'calculates dvd reserves properly' do
      film = create(:dvd_reserve_film)
      film.film_revenue_percentages.update_all({ value: 50 })
      # first report
      report = create(:dvd_reserve_royalty_report)
      report.create_empty_streams!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 100, current_expense: 50 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(350)
      expect(report.current_reserve).to eq(25)
      expect(report.cume_total).to eq(0)
      expect(report.cume_reserve).to eq(0)
      expect(report.joined_reserve).to eq(25)
      expect(report.joined_total).to eq(350)
      expect(report.amount_due).to eq(-2500)
      expect(report.joined_amount_due).to eq(-2175)
      expect(response).to render_template('api/royalty_reports/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      # second report
      report = create(:dvd_reserve_royalty_report, quarter: 2)
      report.create_empty_streams!
      report.transfer_and_calculate_from_previous_report!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 200, current_expense: 50 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(1050)
      expect(report.current_reserve).to eq(50)
      expect(report.cume_total).to eq(350)
      expect(report.cume_reserve).to eq(25)
      expect(report.joined_total).to eq(1400)
      expect(report.joined_reserve).to eq(75)
      expect(report.amount_due).to eq(-2175)
      expect(report.joined_amount_due).to eq(-1175)
      expect(response.status).to eq(200)
      # third report
      report = create(:dvd_reserve_royalty_report, quarter: 3)
      report.create_empty_streams!
      report.transfer_and_calculate_from_previous_report!
      streams = {}
      report.royalty_revenue_streams.each do |stream|
        streams[stream.id.to_s] = { current_revenue: 300, current_expense: 50 }
      end
      post :update, params: { id: report.id, report: {}, streams: streams }, as: :json
      report.reload
      expect(report.current_total).to eq(1750)
      expect(report.current_reserve).to eq(75)
      expect(report.cume_total).to eq(1400)
      expect(report.cume_reserve).to eq(75)
      expect(report.joined_total).to eq(3150)
      expect(report.joined_reserve).to eq(150)
      expect(report.joined_liquidated_reserve).to eq(25)
      expect(report.amount_due).to eq(-1175)
      expect(report.joined_amount_due).to eq(525)
      expect(response.status).to eq(200)
    end

  end

  context '#export' do

    it 'returns an OK status code' do
      create(:no_expenses_recouped_film)
      report = create(:no_expenses_recouped_royalty_report)
      get :export, params: { id: report.id }
      expect(response.status).to eq(200)
    end

  end

  context '#export_all' do

    it 'returns an OK status code' do
      get :export_all
      expect(response.status).to eq(200)
    end

  end

  context '#send_all' do

    it 'returns an OK status code' do
      get :send_all
      expect(response.status).to eq(200)
    end

  end

  context '#totals' do

    it 'returns an OK status code' do
      get :totals
      expect(response.status).to eq(200)
    end

  end

  context '#error_check' do

    it 'returns an OK status code' do
      get :error_check
      expect(response.status).to eq(200)
    end

  end

  context '#import' do

    it 'imports data properly' do

      create(:no_expenses_recouped_film)
      create(:no_expenses_recouped_royalty_report).create_empty_streams!
      create(:theatrical_expenses_recouped_from_top_film)
      create(:theatrical_expenses_recouped_from_top_royalty_report).create_empty_streams!
      create(:expenses_recouped_from_licensor_share_film)
      create(:expenses_recouped_from_licensor_share_royalty_report).create_empty_streams!
      create(:gr_percentage_film)
      create(:gr_percentage_royalty_report).create_empty_streams!
      create(:gr_percentage_theatrical_film)
      create(:gr_percentage_theatrical_royalty_report).create_empty_streams!

      film = create(:expenses_recouped_from_top_film, mg: 0, e_and_o: 0)
      film.film_revenue_percentages.update_all({ value: 50 })
      q1_report = create(:expenses_recouped_from_top_royalty_report, mg: 0, e_and_o: 0)
      q1_report.create_empty_streams!

      time_started = Time.now.to_s
      job = Job.create!(job_id: time_started)
      q1_report.royalty_revenue_streams.each_with_index do |stream, index|
        stream.update!(current_revenue: 100 + index, joined_revenue: 100 + index)
      end
      q1_report.calculate!

      ImportSageData.perform_async(2019, 2, time_started, 'revenue', '/spec/support/revenue.xlsx', false)
      ImportSageData.perform_async(2019, 2, time_started, 'expenses', '/spec/support/expenses.xlsx', false)
      ImportSageData.drain

      # new reports are created

      expect(RoyaltyReport.where({ year: 2019, quarter: 2 }).count).to eq(6)

      q2_report = RoyaltyReport.find_by({ film_id: film.id, year: 2019, quarter: 2 })
      expect(q2_report.current_total_revenue).to eq(40_666.33)
      expect(q2_report.current_total).to eq(20_283)
      expect(q2_report.cume_total_revenue).to eq(1491)
      expect(q2_report.cume_total).to eq(745.50)
      expect(q2_report.joined_total_revenue).to eq(40_666.33 + 1491)
      expect(q2_report.joined_total).to eq(21_028.50)
      expect(q2_report.amount_paid).to eq(745.50)
      expect(q2_report.amount_due).to eq(0)
      expect(q2_report.joined_amount_due).to eq(20_283)

      q2_report_streams = q2_report.royalty_revenue_streams
      q2_report_streams.each_with_index do |stream, index|
        expect(stream.current_revenue).to eq([0, 0, 35_393.95, 0, 0, 0, 708.10, 143.81, 0, 4167.93, 252.54, 0, 0, 0][index])
        expect(stream.current_expense).to eq([0, 9, 16.31, 0, 0, 0, 0, 0, 0, 75, 0, 0, 0, 0][index])
        expect(stream.current_difference).to eq([0, -9, 35_377.64, 0, 0, 0, 708.10, 143.81, 0, 4092.93, 252.54, 0, 0, 0][index])
        expect(stream.current_licensor_share).to eq(
          [0, -4.5, 17_688.82, 0, 0, 0, 354.05, 71.9, 0, 2046.46, 126.27, 0, 0, 0].map { |value| value.to_d.round(2) }[index]
        )
        expect(stream.cume_revenue).to eq(100 + index)
        expect(stream.joined_revenue).to eq(stream.current_revenue + stream.cume_revenue)
      end

    end

  end

end
