require 'rails_helper'
require 'support/controllers_helper'
require 'webmock/rspec'

RSpec.describe Api::DvdCustomersController do

  before do
    WebMock.enable!
  end

  before(:each) do
    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'invoices@dvdvendor.com'"
    ).to_return(
      body: {
        data: [],
      }.to_json
    )

    stub_request(
      :get,
      "https://api.stripe.com/v1/customers/search?query=email:'bob@dvdvendor.com'"
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
      dvd_customer = create(:dvd_customer)
      get :show, params: { id: dvd_customer.id }
      expect(response).to render_template('api/dvd_customers/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["dvdCustomer"]["stripeId"]).to eq("")
    end

    it 'returns the stripe ID if a customer with the email address exists in Stripe' do
      dvd_customer = create(:dvd_customer, invoices_email: "bob@dvdvendor.com")
      get :show, params: { id: dvd_customer.id }
      expect(response).to render_template('api/dvd_customers/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["dvdCustomer"]["stripeId"]).to eq("asdf")
    end

    it 'returns the stripe ID until the email address is changed' do
      dvd_customer = create(:dvd_customer, invoices_email: "bob@dvdvendor.com")
      get :show, params: { id: dvd_customer.id }
      expect(response).to render_template('api/dvd_customers/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["dvdCustomer"]["stripeId"]).to eq("asdf")

      dvd_customer.update!(invoices_email: "invoices@dvdvendor.com")

      get :show, params: { id: dvd_customer.id }
      expect(response).to render_template('api/dvd_customers/show', formats: [:json], handlers: [:jbuilder])
      expect(response.status).to eq(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response["dvdCustomer"]["stripeId"]).to eq("")
    end

  end

end
