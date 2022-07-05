require 'rails_helper'
require 'support/models_helper'

RSpec.describe Dvd do

  before do
    @dvd = Dvd.new
  end

  it 'allows empty dates' do
    @dvd.valid?
    expect(@dvd.errors.messages[:pre_book_date]).to match_array([])
  end

  it 'does not allow invalid dates' do
    @dvd.pre_book_date = "asdf"
    @dvd.retail_date = "asdf"
    @dvd.valid?
    expect(@dvd.errors.messages[:pre_book_date]).to eq ['is not a valid date']
    expect(@dvd.errors.messages[:retail_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@dvd)
  end

end