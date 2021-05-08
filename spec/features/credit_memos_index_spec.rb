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
    expect(page).to have_content 'CM23'
    expect(page).to have_content 'DVD Vendor'
  end

  it 'filters credit memos' do
    create(:credit_memo, { number: 'CM24', num: 24 })
    create(:credit_memo, { number: 'CM25', num: 25 })
    create(:credit_memo, { number: 'CM26', num: 26 })
    create(:credit_memo, { number: 'CM27', num: 27 })
    create(:credit_memo, { number: 'CM28', num: 28 })
    create(:credit_memo, { number: 'CM29', num: 29 })
    create(:credit_memo, { number: 'CM30', num: 30 })
    create(:credit_memo, { number: 'CM31', num: 31 })
    create(:credit_memo, { number: 'CM32', num: 32 })
    visit credit_memos_path(as: $admin_user)
    search_index({
      num: { start: 26, end: 28, type: :number_range }
    })
    expect(page).to have_no_content('CM24')
    expect(page).to have_no_content('CM25')
    expect(page).to have_content('CM26')
    expect(page).to have_content('CM27')
    expect(page).to have_content('CM28')
    expect(page).to have_no_content('CM29')
    expect(page).to have_no_content('CM30')
    expect(page).to have_no_content('CM31')
    expect(page).to have_no_content('CM32')
  end

  it 'starts the export job' do
    visit credit_memos_path(as: $admin_user)
    find('.export-button', text: 'Export').click
    expect(page).to have_content('Exporting Credit Memos')
  end

end
