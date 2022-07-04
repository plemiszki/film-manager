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
    @payment.update(date: "2/28/20")
    expect(@payment.date.month).to be(2)
    expect(@payment.date.day).to be(28)
    expect(@payment.errors.messages[:date]).to match_array([])
  end

end