require "rails_helper"

RSpec.describe Api::FilmsController do

  before(:all) do
    set_up
  end

  context '#create' do
    it 'creates a film' do
      sign_in_as(User.first)
      post :create, { title: 'New Film', film_type: 'Feature', length: 90, year: 2002 }
      expect(Film.count).to eq(2)
    end
  end

end
