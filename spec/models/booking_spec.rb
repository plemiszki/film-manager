require 'rails_helper'
require 'support/models_helper'

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

  it 'does not allow end_date after start_date' do
    @booking.start_date = Date.today
    @booking.end_date = Date.today - 1.day
    @booking.valid?
    expect(@booking.errors.messages[:end_date]).to eq ['cannot be before start date']
  end

  # payment reminders

  it 'only triggers payment reminders for bookings with start dates in the next four weeks' do
    upcoming_booking = create(:payment_reminder_booking)
    distant_future = Date.today + 4.weeks + 1.day
    upcoming_booking_distant_future = create(:payment_reminder_booking, start_date: distant_future, end_date: distant_future)
    past = Date.today - 1.day
    past_booking = create(:payment_reminder_booking, start_date: past, end_date: past)
    reminder_booking_ids = Booking.payment_reminders.pluck(:id)
    expect(reminder_booking_ids).to eq [upcoming_booking.id]
  end

  it 'only triggers payment reminders for non-theatrical/festival bookings' do
    festival_booking = create(:payment_reminder_booking)
    non_theatrical_booking = create(:payment_reminder_booking, booking_type: 'Non-Theatrical')
    theatrical_booking = create(:payment_reminder_booking, booking_type: 'Theatrical')
    reminder_booking_ids = Booking.payment_reminders.pluck(:id)
    expect(reminder_booking_ids).to eq [festival_booking.id, non_theatrical_booking.id]
  end

  it 'only triggers payment reminders for bookings without payments' do
    booking_with_payments = create(:payment_reminder_booking_with_payments)
    booking_without_payments = create(:payment_reminder_booking)
    reminder_booking_ids = Booking.payment_reminders.pluck(:id)
    expect(reminder_booking_ids).to eq [booking_without_payments.id]
  end

end
