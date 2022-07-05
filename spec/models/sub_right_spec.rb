require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe SubRight do

  before do
    @sub_right = SubRight.new
  end

  it 'does not allow empty start/end dates' do
    @sub_right.valid?
    expect(@sub_right.errors.messages[:start_date]).to eq ["can't be blank"]
    expect(@sub_right.errors.messages[:end_date]).to eq ["can't be blank"]
  end

  it 'does not allow invalid dates' do
    @sub_right.start_date = "asdf"
    @sub_right.end_date = "asdf"
    @sub_right.valid?
    expect(@sub_right.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@sub_right.errors.messages[:end_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@sub_right)
  end

  it 'does not allow end_date after start_date' do
    @sub_right.start_date = Date.today
    @sub_right.end_date = Date.today - 1.day
    @sub_right.valid?
    expect(@sub_right.errors.messages[:end_date]).to eq ['cannot be before start date']
  end

end