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
    search_index({
      invoice_type: { value: 'booking', type: :select }
    })
    expect(page).to have_content('1B')
    expect(page).to have_no_content('1D')
    search_index({
      invoice_type: { value: 'dvd', type: :select }
    })
    expect(page).to have_no_content('1B')
    expect(page).to have_content('1D')
  end

  it 'starts the export job' do
    visit invoices_path(as: $admin_user)
    click_btn('Export')
    expect(page).to have_content('Exporting Invoices')
  end

end
