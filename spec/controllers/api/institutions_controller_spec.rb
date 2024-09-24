require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Api::InstitutionsController do

  before(:each) do
    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bobby@harvarduniversity.com'"
    ).to_return(
      body: {
        data: [],
      }.to_json
    )

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bobbyjoe@harvarduniversity.com'"
    ).to_return(
      body: {
        data: [{
          id: "asdf",
        }],
      }.to_json
    )
  end

  context '#show' do
    render_views

    it 'returns a blank stripe ID if no customer with the email address exists in Stripe' do
      institution = create(:institution)
      get :show, params: { id: institution.id }
      expect(response).to render_template('api/institutions/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["institution"]["stripeId"]).to eq("")
    end

    it 'returns the stripe ID if a customer with the email address exists in Stripe' do
      institution = create(:institution, email: "bobbyjoe@harvarduniversity.com")
      get :show, params: { id: institution.id }
      expect(response).to render_template('api/institutions/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["institution"]["stripeId"]).to eq("asdf")
    end

    it 'returns the stripe ID until the email address is changed' do
      institution = create(:institution, email: "bobbyjoe@harvarduniversity.com")
      get :show, params: { id: institution.id }
      expect(response).to render_template('api/institutions/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["institution"]["stripeId"]).to eq("asdf")

      institution.update!(email: "bobby@harvarduniversity.com")

      get :show, params: { id: institution.id }
      expect(response).to render_template('api/institutions/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["institution"]["stripeId"]).to eq("")
    end

  end

end
