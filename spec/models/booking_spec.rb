require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Booking do

  before do
    @booking = Booking.new
  end

  it 'does not allow empty date_added, start_date, or end_date fields' do
    @booking.valid?
    expect(@booking.errors.messages[:date_added]).to eq ["can't be blank"]
    expect(@booking.errors.messages[:start_date]).to eq ["can't be blank"]
    expect(@booking.errors.messages[:end_date]).to eq ["can't be blank"]
  end

  it 'allows certain empty date fields' do
    @booking.valid?
    expect(@booking.errors.messages[:materials_sent]).to match_array([])
    expect(@booking.errors.messages[:imported_advance_invoice_sent]).to match_array([])
    expect(@booking.errors.messages[:imported_overage_invoice_sent]).to match_array([])
    expect(@booking.errors.messages[:booking_confirmation_sent]).to match_array([])
  end

  it 'does not allow invalid dates' do
    @booking.date_added = "asdf"
    @booking.start_date = "asdf"
    @booking.end_date = "asdf"
    @booking.materials_sent = "asdf"
    @booking.imported_advance_invoice_sent = "asdf"
    @booking.imported_overage_invoice_sent = "asdf"
    @booking.booking_confirmation_sent = "asdf"
    @booking.valid?
    expect(@booking.errors.messages[:date_added]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:end_date]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:materials_sent]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:imported_advance_invoice_sent]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:imported_overage_invoice_sent]).to eq ['is not a valid date']
    expect(@booking.errors.messages[:booking_confirmation_sent]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@booking)
  end

end