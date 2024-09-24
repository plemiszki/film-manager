require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::UsersController do

  context '#show' do
    it 'returns an OK status code' do
      get :show, params: { id: User.last.id }
      expect(response).to render_template('api/users/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
    end
  end

end
