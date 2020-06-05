require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::FilmsController do

  before(:each) do
    create(:no_expenses_recouped_film)
  end

  context '#create' do
    it 'creates a film' do
      post :create, params: { title: 'New Film', film_type: 'Feature', length: 90, year: 2002 }
      expect(Film.count).to eq(2)
      expect(response).to render_template('api/films/index.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

  context '#show' do
    it 'returns an OK status code' do
      get :show, params: { id: Film.last.id }
      expect(response).to render_template('api/films/show.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

end
