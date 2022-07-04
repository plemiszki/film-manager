require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe SubRight do

  before do
    @sub_right = SubRight.new
  end

  it 'does not allow empty start/end dates' do
    @sub_right.valid?
    expect(@sub_right.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@sub_right.errors.messages[:end_date]).to eq ['is not a valid date']
  end

  it 'does not allow invalid dates' do
    @sub_right.start_date = "asdf"
    @sub_right.end_date = "asdf"
    @sub_right.valid?
    expect(@sub_right.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@sub_right.errors.messages[:end_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    @sub_right.update(start_date: "2/28/20", end_date: "3/1/20")
    expect(@sub_right.start_date.month).to be(2)
    expect(@sub_right.start_date.day).to be(28)
    expect(@sub_right.end_date.month).to be(3)
    expect(@sub_right.end_date.day).to be(1)
  end

end