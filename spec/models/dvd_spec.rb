require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Return do

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
    @dvd.update(pre_book_date: "2/28/20", retail_date: "3/1/20")
    expect(@dvd.pre_book_date.month).to be(2)
    expect(@dvd.pre_book_date.day).to be(28)
    expect(@dvd.retail_date.month).to be(3)
    expect(@dvd.retail_date.day).to be(1)
    expect(@dvd.errors.messages[:pre_book_date]).to match_array([])
    expect(@dvd.errors.messages[:retail_date]).to match_array([])
  end

end