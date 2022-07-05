require 'rails_helper'
require 'support/models_helper'

RSpec.describe VirtualBooking do

  before do
    @virtual_booking = VirtualBooking.new
  end

  it 'does not allow empty date fields' do
    @virtual_booking.valid?
    expect(@virtual_booking.errors.messages[:date_added]).to eq ["can't be blank"]
    expect(@virtual_booking.errors.messages[:start_date]).to eq ["can't be blank"]
    expect(@virtual_booking.errors.messages[:end_date]).to eq ["can't be blank"]
  end

  it 'does not allow invalid dates' do
    @virtual_booking.date_added = "asdf"
    @virtual_booking.start_date = "asdf"
    @virtual_booking.end_date = "asdf"
    @virtual_booking.valid?
    expect(@virtual_booking.errors.messages[:date_added]).to eq ['is not a valid date']
    expect(@virtual_booking.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@virtual_booking.errors.messages[:end_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@virtual_booking)
  end

end