require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe FilmRight do

  before do
    @film_right = FilmRight.new
  end

  it 'allows empty start/end dates' do
    @film_right.valid?
    expect(@film_right.errors.messages[:start_date]).to match_array([])
    expect(@film_right.errors.messages[:end_date]).to match_array([])
  end

  it 'does not allow invalid dates' do
    @film_right.start_date = "asdf"
    @film_right.end_date = "asdf"
    @film_right.valid?
    expect(@film_right.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@film_right.errors.messages[:end_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    @film_right.update(start_date: "2/28/20", end_date: "3/1/20")
    expect(@film_right.start_date.month).to be(2)
    expect(@film_right.start_date.day).to be(28)
    expect(@film_right.end_date.month).to be(3)
    expect(@film_right.end_date.day).to be(1)
  end

end