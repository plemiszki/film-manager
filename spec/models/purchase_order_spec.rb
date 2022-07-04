require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe Return do

  before do
    @purchase_order = PurchaseOrder.new
  end

  it 'does not allow empty order dates' do
    @purchase_order.valid?
    expect(@purchase_order.errors.messages[:order_date]).to eq ['is not a valid date']
  end

  it 'does not allow invalid dates' do
    @purchase_order.order_date = "asdf"
    @purchase_order.ship_date = "asdf"
    @purchase_order.valid?
    expect(@purchase_order.errors.messages[:order_date]).to eq ['is not a valid date']
    expect(@purchase_order.errors.messages[:ship_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    @purchase_order.update(order_date: "2/28/20", ship_date: "3/1/20")
    expect(@purchase_order.order_date.month).to be(2)
    expect(@purchase_order.order_date.day).to be(28)
    expect(@purchase_order.ship_date.month).to be(3)
    expect(@purchase_order.ship_date.day).to be(1)
  end

end