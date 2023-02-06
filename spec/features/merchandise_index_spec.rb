require 'rails_helper'
require 'support/features_helper'

describe 'merchandise_index', type: :feature do

  before :each do
    create(:label)
    create(:film)
    create(:merchandise_type)
    create(:merchandise_item)
  end

  it 'is gated' do
    visit merchandise_items_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all merchandise' do
    visit merchandise_items_path(as: $admin_user)
    expect(page).to have_content 'Merchandise'
    expect(page).to have_content "Film Movement Women's T-shirt"
    expect(page).to have_content "Shirt"
    expect(page).to have_content "Small"
    expect(page).to have_content "$19.95"
  end

  it 'adds merchandise' do
    visit merchandise_items_path(as: $admin_user)
    click_btn("Add Merchandise Item")
    fill_out_and_submit_modal({
      name: 'Wilby Wonderful Shirt',
      merchandise_type_id: { type: :select, value: 1 },
      description: 'totally rad t-shirt',
      size: 'Small',
      price: 24.95,
      inventory: 20,
      film_id: { type: :select_modal, value: 'Wilby Wonderful' }
    }, :input)
    expect(find('table')).to have_content 'Wilby Wonderful Shirt'
    verify_db(
      entity: MerchandiseItem.last,
      data: {
        name: 'Wilby Wonderful Shirt',
        merchandise_type_id: 1,
        description: 'totally rad t-shirt',
        size: 'Small',
        price: 24.95,
        inventory: 20,
        film_id: 1
      }
    )
  end

  it 'validates merchandise' do
    visit merchandise_items_path(as: $admin_user)
    click_btn("Add Merchandise Item")
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content "Name can't be blank"
    expect(page).to have_content "Price is not a number"
    expect(page).to have_content "Inventory is not a number"
  end

end
