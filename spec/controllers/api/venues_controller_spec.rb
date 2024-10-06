require 'rails_helper'
require 'support/controllers_helper'
require 'webmock/rspec'

RSpec.describe Api::VenuesController do

  before do
    WebMock.enable!

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bobby@lincolncenter.com'"
    ).to_return(
      body: {
        data: [],
      }.to_json
    )

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bobbyjoe@lincolncenter.com'"
    ).to_return(
      body: {
        data: [{
          id: "asdf",
        }],
      }.to_json
    )
  end

  after do
    WebMock.disable!
  end

  context '#show' do
    render_views

    it 'returns a blank stripe ID if no customer with the email address exists in Stripe' do
      venue = create(:venue)
      get :show, params: { id: venue.id }
      expect(response).to render_template('api/venues/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["venue"]["stripeId"]).to eq("")
    end

    it 'returns the stripe ID if a customer with the email address exists in Stripe' do
      venue = create(:venue, email: "bobbyjoe@lincolncenter.com")
      get :show, params: { id: venue.id }
      expect(response).to render_template('api/venues/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["venue"]["stripeId"]).to eq("asdf")
    end

    it 'returns the stripe ID until the email address is changed' do
      venue = create(:venue, email: "bobbyjoe@lincolncenter.com")
      get :show, params: { id: venue.id }
      expect(response).to render_template('api/venues/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["venue"]["stripeId"]).to eq("asdf")

      venue.update!(email: "bobby@lincolncenter.com")

      get :show, params: { id: venue.id }
      expect(response).to render_template('api/venues/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["venue"]["stripeId"]).to eq("")
    end

  end

end
