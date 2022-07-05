require 'rails_helper'
require 'support/models_helper'

RSpec.describe Return do

  before do
    @return = Return.new(
      customer: create(:dvd_customer),
    )
  end

  it 'does not allow empty dates' do
    @return.valid?
    expect(@return.errors.messages[:date]).to eq ["can't be blank"]
  end

  it 'does not allow invalid dates' do
    @return.date = "asdf"
    @return.valid?
    expect(@return.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@return)
  end

end