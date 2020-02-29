require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::UsersController do

  context '#show' do
    it 'returns an OK status code' do
      get :show, id: User.last.id
      expect(response).to render_template('api/users/show.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

end
