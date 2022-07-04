require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Return do

  before do
    @return = Return.new(
      customer: create(:dvd_customer),
    )
  end

  it 'does not allow empty dates' do
    @return.valid?
    expect(@return.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'does not allow invalid dates' do
    @return.date = "asdf"
    @return.valid?
    expect(@return.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    @return.update(date: "2/28/20")
    expect(@return.date.month).to be(2)
    expect(@return.date.day).to be(28)
  end

end