require 'rails_helper'
require 'support/controllers_helper'

# HACK UNTIL I UPGRADE TO RAILS 5 -------
if RUBY_VERSION>='2.6.0'
  if Rails.version < '5'
    class ActionController::TestResponse < ActionDispatch::TestResponse
      def recycle!
        # hack to avoid MonitorMixin double-initialize error:
        @mon_mutex_owner_object_id = nil
        @mon_mutex = nil
        initialize
      end
    end
  else
    puts "Monkeypatch for ActionController::TestResponse no longer needed"
  end
end
# ----------------------------------------

RSpec.describe Api::FilmsController do

  before(:each) do
    create(:no_expenses_recouped_film)
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
