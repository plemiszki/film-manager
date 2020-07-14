require 'rails_helper'
require 'support/features_helper'

describe 'credit_memos_index', type: :feature do

  before(:each) do
    create(:dvd_customer)
    create(:credit_memo)
  end

  it 'is gated' do
    visit credit_memos_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all credit memos' do
    visit credit_memos_path(as: $admin_user)
    expect(page).to have_content 'Credit Memos'
    expect(page).to have_content 'NH345DJ'
    expect(page).to have_content '23'
    expect(page).to have_content 'DVD Vendor'
  end

  # it 'filters credit memos by type' do
  #   visit credit_memos_path(as: $admin_user)
  #   update_filter('Booking')
  #   expect(page).to have_content('1B')
  #   expect(page).to have_no_content('1D')
  #   update_filter('DVD')
  #   expect(page).to have_no_content('1B')
  #   expect(page).to have_content('1D')
  # end

end

def update_filter(type)
  find('.orange-button', text: 'Filter').click
  within('.filter-modal') do
    click_nice_select_option('select', type)
    find('.orange-button', text: 'Update Filter').click
  end
end
