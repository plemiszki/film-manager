require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::EmailsController do

  context '#index' do
    render_views

    it 'returns emails' do
      get :index
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["emails"]).to be_an(Array)
      expect(response.status).to eq(200)
    end

    it 'returns licensor email addresses when licensor_id is present' do
      licensor = Licensor.first
      get :index, params: { licensor_id: licensor.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["licensorEmailAddresses"]).to eq(licensor.email_addresses)
      expect(response.status).to eq(200)
    end

    it 'returns quarters for a licensor with royalty reports' do
      licensor = Licensor.first
      film = create(:no_expenses_recouped_film)
      create(:royalty_report, film_id: film.id, quarter: 1, year: 2024)
      create(:royalty_report, film_id: film.id, quarter: 3, year: 2024)
      create(:royalty_report, film_id: film.id, quarter: 2, year: 2023)
      get :index, params: { licensor_id: licensor.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["quarters"]).to eq([
        { "quarter" => 2, "year" => 2023 },
        { "quarter" => 1, "year" => 2024 },
        { "quarter" => 3, "year" => 2024 },
      ])
    end

    it 'returns an empty quarters array when licensor has no royalty reports' do
      licensor = Licensor.first
      get :index, params: { licensor_id: licensor.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["quarters"]).to eq([])
    end

    it 'does not return quarters when licensor_id is not present' do
      get :index
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["quarters"]).to be_nil
    end

    it 'only returns quarters for films belonging to the licensor' do
      licensor = Licensor.first
      other_licensor = create(:licensor, name: 'Other Licensor', email: 'other@example.com')
      film = create(:no_expenses_recouped_film)
      other_film = create(:no_expenses_recouped_film, title: 'Other Film', licensor_id: other_licensor.id)
      create(:royalty_report, film_id: film.id, quarter: 1, year: 2024)
      create(:royalty_report, film_id: other_film.id, quarter: 2, year: 2024)
      get :index, params: { licensor_id: licensor.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["quarters"]).to eq([
        { "quarter" => 1, "year" => 2024 },
      ])
    end

    it 'returns unique quarters when multiple films share the same quarter/year' do
      licensor = Licensor.first
      film1 = create(:no_expenses_recouped_film)
      film2 = create(:no_expenses_recouped_film, title: 'Second Film')
      create(:royalty_report, film_id: film1.id, quarter: 1, year: 2024)
      create(:royalty_report, film_id: film2.id, quarter: 1, year: 2024)
      get :index, params: { licensor_id: licensor.id }
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["quarters"]).to eq([
        { "quarter" => 1, "year" => 2024 },
      ])
    end

  end

end
