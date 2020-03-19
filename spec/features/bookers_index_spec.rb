require 'rails_helper'
require 'support/features_helper'

describe 'bookers_index', type: :feature do

  before(:each) do
    Booker.create!(name: 'Some Booker', email: 'booker@foo.com', phone: '212-941-7744')
  end

  it 'is gated' do
    visit bookers_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all bookers' do
    visit bookers_path(as: $admin_user)
    expect(page).to have_content 'Bookers'
    expect(page).to have_content 'Some Booker'
  end

  it 'adds new bookers' do
    visit bookers_path(as: $admin_user)
    find('.float-button', text: 'Add Booker').click
    fill_out_and_submit_modal({
      name: 'Joe Booker',
      email: 'joe@somewhere.com',
      phone: '555-555-5555'
    }, :input)
    expect(find('.admin-table')).to have_content 'Joe Booker'
    expect(Booker.last.attributes).to include(
      'name' => 'Joe Booker',
      'email' => 'joe@somewhere.com',
      'phone' => '555-555-5555'
    )
  end

  it 'validates new bookers properly' do
    visit bookers_path(as: $admin_user)
    find('.float-button', text: 'Add Booker').click
    fill_out_and_submit_modal({
      name: ''
    }, :input)
    expect(page).to have_content "Name can't be blank"
  end

end
