require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::WebsiteController do

  context '#films' do
    it 'returns an OK status code' do
      get :films, params: { api_key: ENV.fetch("CYBER_NY_API_KEY") }
      expect(response).to render_template('api/website/films', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end
  end

  context '#bookings' do
    it 'returns an OK status code' do
      get :bookings, params: { api_key: ENV.fetch("CYBER_NY_API_KEY") }
      expect(response).to render_template('api/website/bookings', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end
  end

  context '#merchandise' do
    it 'returns an OK status code' do
      get :merchandise, params: { api_key: ENV.fetch("CYBER_NY_API_KEY") }
      expect(response).to render_template('api/website/merchandise', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end
  end

end
