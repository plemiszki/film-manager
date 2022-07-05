require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Payment do

  before do
    @payment = Payment.new
  end

  it 'does not allow empty dates' do
    @payment.valid?
    expect(@payment.errors.messages[:date]).to eq ["can't be blank"]
  end

  it 'does not allow invalid dates' do
    @payment.date = "asdf"
    @payment.valid?
    expect(@payment.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@payment)
  end

end