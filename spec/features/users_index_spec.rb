require 'rails_helper'
require 'support/features_helper'

describe 'users_index', type: :feature do

  it 'is gated' do
    visit users_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all users' do
    visit users_path(as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Users'
    expect(page).to have_content 'Peter Lemiszki'
    expect(page).to have_content 'Software Engineer'
  end

  it 'adds new users' do
    visit users_path(as: $admin_user)
    find('.btn', text: 'Add User').click
    fill_out_and_submit_modal({
      name: 'Bob',
      email: 'bob@domain.com',
      password: 'password'
    }, :input)
    expect(find('.admin-table')).to have_content 'Bob'
    expect(User.last.attributes).to include(
      'name' => 'Bob',
      'email' => 'bob@domain.com',
      'access' => 'user'
    )
  end

  it 'validates new users' do
    visit users_path(as: $admin_user)
    find('.btn', text: 'Add User').click
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content "Name can't be blank"
    expect(page).to have_content "Email is invalid"
    expect(page).to have_content "Password can't be blank"
  end

end
