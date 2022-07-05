require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Invoice do

  before do
    @invoice = Invoice.new
  end

  it 'allows empty sent dates' do
    @invoice.valid?
    expect(@invoice.errors.messages[:sent_date]).to match_array([])
  end

  it 'does not allow invalid sent dates' do
    @invoice.sent_date = "asdf"
    @invoice.valid?
    expect(@invoice.errors.messages[:sent_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@invoice)
  end

end