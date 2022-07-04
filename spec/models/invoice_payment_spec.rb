require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe InvoicePayment do

  before do
    @invoice_payment = InvoicePayment.new(
      invoice: create(:booking_invoice),
      payment: create(:payment),
    )
  end

  it 'does not allow empty dates' do
    @invoice_payment.valid?
    expect(@invoice_payment.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'does not allow invalid dates' do
    @invoice_payment.date = "asdf"
    @invoice_payment.valid?
    expect(@invoice_payment.errors.messages[:date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    @invoice_payment.update(date: "2/28/20")
    expect(@invoice_payment.date.month).to be(2)
    expect(@invoice_payment.date.day).to be(28)
  end

end