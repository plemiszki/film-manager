require 'rails_helper'
require 'support/features_helper'

describe 'institution_orders_index', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:institution)
    order = create(:institution_order, shipping_fee: 20)
    create(:institution_order_film, price: 1150)
    create(:invoice, invoice_type: "institution", number: "1E", sent_date: Date.new(2024, 1, 4), institution_order: order)
  end

  it 'is gated' do
    visit institution_orders_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all institution orders' do
    visit institution_orders_path(as: $admin_user)
    within('#institution-orders-index') do
      expect(page).to have_content '1/3/2024' # order date
      expect(page).to have_content '1000' # order number
      expect(page).to have_content 'Harvard University' # customer name
      expect(page).to have_content '$1,170.00' # total
      expect(page).to have_content '1/4/2024' # invoice sent date
      expect(page).to have_content '1E' # invoice number
    end
  end

  it 'adds institution orders' do
    create(:institution, label: 'Columbia University', sage_id: 'COLUMBIA')
    visit institution_orders_path(as: $admin_user)
    within('#institution-orders-index') do
      click_btn("Add Order")
    end
    info = {
      institution_id: { value: 'Columbia University', type: :select_modal },
      order_date: '2/1/2024',
      number: '2000',
    }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: InstitutionOrder.second,
      data: info.merge({ order_date: Date.new(2024, 2, 1), institution_id: 2 }),
    )
  end

  it 'validates institution orders' do
    visit institution_orders_path(as: $admin_user)
    within('#institution-orders-index') do
      click_btn("Add Order")
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Institution can't be blank")
    expect(page).to have_content("Order date can't be blank")

    info = {
      institution_id: { value: 'Harvard University', type: :select_modal },
      number: '1000',
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_content("Number has already been taken")
  end

end
