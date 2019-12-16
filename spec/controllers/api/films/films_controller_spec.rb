require "rails_helper"

RSpec.describe Api::FilmsController do

  before(:each) do
    set_up_user_and_label_and_licensor_and_rights_and_revenue_streams
    create(:no_expenses_recouped_film)
    sign_in_as(User.first)
  end

  context '#create' do
    it 'creates a film' do
      post :create, { title: 'New Film', film_type: 'Feature', length: 90, year: 2002 }
      expect(Film.count).to eq(2)
      expect(response).to render_template('api/films/index.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

  context '#show' do
    it 'returns an OK status code' do
      get :show, id: Film.last.id
      expect(response).to render_template('api/films/show.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

end
