require 'rails_helper'
require 'support/models_helper'

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
    test_parse_all_date_fields(@film_right)
  end

end