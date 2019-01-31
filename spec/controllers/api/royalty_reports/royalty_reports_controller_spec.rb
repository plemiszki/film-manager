require 'rails_helper'

RSpec.describe Api::RoyaltyReportsController do

  context '#export' do
    it 'returns an OK status code' do
      sign_in_as(User.first)
      get :export, id: 1
      expect(response.status).to eq(200)
    end
  end

end
