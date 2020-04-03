require 'rails_helper'
require 'support/features_helper'

describe 'invoice_details', type: :feature do

  before(:each) do
    @invoice = create(:dvd_invoice)
  end

  it 'is gated' do
    visit invoice_path(@invoice)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the invoice' do
    visit invoice_path(@invoice, as: $admin_user)
    expect(page).to have_content 'Invoice Details'
    expect(page).to have_content '1D'
    expect(page).to have_content 'Alliance Inventory'
    expect(page).to have_content '300 Omicron Court'
    expect(page).to have_content 'Room 613'
    expect(page).to have_content 'Shepherdsville, KY 40165'
    expect(page).to have_content Date.today.to_s
    expect(page).to have_content '549596MD'
  end

  it 'displays items on the invoice, and total' do
    create(:invoice_row)
    @invoice.update!(total: 24.94)
    visit invoice_path(@invoice, as: $admin_user)
    within('.fm-admin-table') do
      expect(page).to have_content 'Some Film'
      expect(page).to have_content '$12.47'
      expect(page).to have_content '$24.94'
    end
    expect(find('h2', text: 'Total').find(:xpath, '..')).to have_content '$24.94'
  end

end
