require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe PurchaseOrder do

  before do
    @purchase_order = PurchaseOrder.new
  end

  it 'does not allow empty order dates' do
    @purchase_order.valid?
    expect(@purchase_order.errors.messages[:order_date]).to eq ["can't be blank"]
  end

  it 'does not allow invalid dates' do
    @purchase_order.order_date = "asdf"
    @purchase_order.ship_date = "asdf"
    @purchase_order.valid?
    expect(@purchase_order.errors.messages[:order_date]).to eq ['is not a valid date']
    expect(@purchase_order.errors.messages[:ship_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@purchase_order)
  end

end