require 'rails_helper'
require 'support/features_helper'

describe 'credit_memo_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create_dvd_types
    create(:dvd)
    create(:dvd_customer)
    dvd_return = create(:return)
    create(:return_item)
    create(:setting)
    @credit_memo = dvd_return.generate_credit_memo!
  end

  it 'is gated' do
    visit credit_memo_path(@credit_memo)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the credit_memo' do
    visit credit_memo_path(@credit_memo, as: $admin_user)
    expect(page).to have_content 'CM1'
    expect(page).to have_content Date.today.strftime('%-m/%-d/%y')
    expect(page).to have_content '012345678'
    expect(page).to have_content 'DVD Vendor'
    expect(page).to have_content 'Billing Name'
    within('table') do
      expect(page).to have_content 'Wilby Wonderful'
      expect(page).to have_content '$7.99'
    end
    expect(find('h2', text: 'Total').find(:xpath, '..')).to have_content '$7.99'
  end

end
