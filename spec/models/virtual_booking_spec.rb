require 'rails_helper'
require 'support/controllers_helper'

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
    @virtual_booking.update(date_added: "1/3/20", start_date: "2/28/20", end_date: "3/1/20")
    expect(@virtual_booking.date_added.month).to be(1)
    expect(@virtual_booking.date_added.day).to be(3)
    expect(@virtual_booking.start_date.month).to be(2)
    expect(@virtual_booking.start_date.day).to be(28)
    expect(@virtual_booking.end_date.month).to be(3)
    expect(@virtual_booking.end_date.day).to be(1)
  end

end