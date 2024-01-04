require 'rails_helper'
require 'support/features_helper'

describe 'institution_orders_index', type: :feature do

  before(:each) do
    create(:institution)
    create(:institution_order)
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
    end
  end

  it 'adds institution orders' do
    create(:institution, label: 'Columbia University', sage_id: 'COLUMBIA')
    visit institution_orders_path(as: $admin_user)
    within('#institution-orders-index') do
      click_btn("Add Order")
    end
    info = {
      institution_id: { label: 'Columbia University', type: :select },
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
    info = {
      institution_id: { label: 'Harvard University', type: :select }, # TODO: remove when initial value bug fixed
      number: '1000',
    }
    fill_out_and_submit_modal(info, :input)
    expect(page).to have_content("Number has already been taken")
    expect(page).to have_content("Order date can't be blank")
  end

end