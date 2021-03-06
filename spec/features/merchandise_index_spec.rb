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
    find('.orange-button', text: 'Add Merchandise').click
    fill_out_and_submit_modal({
      name: 'Wilby Wonderful Shirt',
      merchandise_type_id: { type: :select, value: 1 },
      description: 'totally rad t-shirt',
      size: 'Small',
      price: 24.95,
      inventory: 20,
      film_id: { type: :select_modal_old, value: 'Wilby Wonderful' }
    }, :orange_button)
    expect(find('.fm-admin-table')).to have_content 'Wilby Wonderful Shirt'
    verify_db({
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
    })
  end

  it 'validates merchandise' do
    visit merchandise_items_path(as: $admin_user)
    find('.orange-button', text: 'Add Merchandise').click
    fill_out_and_submit_modal({}, :orange_button)
    expect(page).to have_content "Name can't be blank"
    expect(page).to have_content "Price is not a number"
    expect(page).to have_content "Inventory is not a number"
  end

end
