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

RSpec.describe Api::UsersController do

  context '#show' do
    it 'returns an OK status code' do
      get :show, id: User.last.id
      expect(response).to render_template('api/users/show.json.jbuilder')
      expect(response.status).to eq(200)
    end
  end

end
