require 'rails_helper'
require 'support/features_helper'

describe 'returns_index', type: :feature do

  before(:each) do
    create(:dvd_customer)
    create(:return)
  end

  it 'is gated' do
    visit returns_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all returns' do
    visit returns_path(as: $admin_user)
    expect(page).to have_content 'DVD Returns'
    expect(page).to have_content '012345678'
    expect(page).to have_content 'DVD Vendor'
  end

  it 'adds new returns' do
    visit returns_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      customer_id: { value: 1, type: :select },
      date: Date.today,
      number: 'return order number'
    }, :orange_button)
    new_return = Return.last
    expect(new_return.attributes).to include(
      'customer_id' => 1,
      'date' => Date.today,
      'number' => 'return order number'
    )
    expect(page).to have_current_path("/returns/#{new_return.id}", ignore_query: true)
  end

  it 'validates new returns properly' do
    visit returns_path(as: $admin_user)
    find('.orange-button', text: 'Add New').click
    fill_out_and_submit_modal({
      customer_id: { value: 1, type: :select }
    }, :orange_button)
    expect(page).to have_content "Number can't be blank"
    expect(page).to have_content "Date can't be blank"
  end

end
