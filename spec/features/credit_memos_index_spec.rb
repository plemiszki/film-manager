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

  it 'filters credit memos' do
    create(:credit_memo, { number: '24' })
    create(:credit_memo, { number: '25' })
    create(:credit_memo, { number: '26' })
    create(:credit_memo, { number: '27' })
    create(:credit_memo, { number: '28' })
    create(:credit_memo, { number: '29' })
    create(:credit_memo, { number: '30' })
    create(:credit_memo, { number: '31' })
    create(:credit_memo, { number: '32' })
    visit credit_memos_path(as: $admin_user)
    update_filter
    expect(page).to have_no_content('24')
    expect(page).to have_no_content('25')
    expect(page).to have_content('26')
    expect(page).to have_content('27')
    expect(page).to have_content('28')
    expect(page).to have_no_content('29')
    expect(page).to have_no_content('30')
    expect(page).to have_no_content('31')
    expect(page).to have_no_content('32')
  end

end

def update_filter
  find('.orange-button', text: 'Filter').click
  within('.filter-modal') do
    find('.starting-number').set('26')
    find('.end-number').set('28')
    find('.orange-button', text: 'Update Filter').click
  end
end
