require "rails_helper"

RSpec.describe Api::UsersController do

  before(:each) do
    set_up
    sign_in_as(User.first)
  end

  context '#show' do
    it 'returns an OK status code' do
      get :show, id: User.last.id
      expect(response).to render_template('api/users/show.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

end
