require 'rails_helper'
require 'support/controllers_helper'
require 'webmock/rspec'

RSpec.describe Api::BookingsController do

  before do
    WebMock.enable!

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'someone@somevenue.com'"
    ).to_return(
      body: {
        data: [],
      }.to_json
    )

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bob@somevenue.com'"
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
      booking = create(:booking)
      get :show, params: { id: booking.id }
      expect(response).to render_template('api/bookings/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["booking"]["stripeId"]).to eq("")
    end

    it 'returns the stripe ID if a customer with the email address exists in Stripe' do
      booking = create(:booking, email: "bob@somevenue.com")
      get :show, params: { id: booking.id }
      expect(response).to render_template('api/bookings/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["booking"]["stripeId"]).to eq("asdf")
    end

    it 'returns the stripe ID until the email address is changed' do
      booking = create(:booking, email: "bob@somevenue.com")
      get :show, params: { id: booking.id }
      expect(response).to render_template('api/bookings/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["booking"]["stripeId"]).to eq("asdf")

      booking.update!(email: "someone@somevenue.com")

      get :show, params: { id: booking.id }
      expect(response).to render_template('api/bookings/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["booking"]["stripeId"]).to eq("")
    end

  end

end
