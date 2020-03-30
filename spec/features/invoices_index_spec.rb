require 'rails_helper'
require 'support/features_helper'

describe 'invoices_index', type: :feature do

  before(:each) do
    create(:dvd_invoice)
    create(:booking_invoice)
  end

  it 'is gated' do
    visit invoices_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all invoices' do
    visit invoices_path(as: $admin_user)
    expect(page).to have_content 'Invoices'
    expect(page).to have_content '549596MD'
    expect(page).to have_content '1D'
    expect(page).to have_content '1B'
  end

  it 'filters invoices by type' do
    visit invoices_path(as: $admin_user)
    update_filter('Booking')
    expect(page).to have_content('1B')
    expect(page).to have_no_content('1D')
    update_filter('DVD')
    expect(page).to have_no_content('1B')
    expect(page).to have_content('1D')
  end

end

def update_filter(type)
  find('.orange-button', text: 'Filter').click
  within('.filter-modal') do
    click_nice_select_option('select', type)
    find('.orange-button', text: 'Update Filter').click
  end
end
