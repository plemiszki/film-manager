require 'rails_helper'
require 'support/features_helper'

describe 'dvd_reports', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    create(:dvd, pre_book_date: Date.today, retail_date: Date.today)
    create(:film, title: 'Ben X')
    create(:dvd, feature_film_id: 2, pre_book_date: Date.today, retail_date: Date.today)
    create(:dvd_customer, name: 'AEC')
    create(:dvd_customer, name: 'Baker & Taylor')
  end

  it 'is gated' do
    visit dvd_reports_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  xit 'calculates report' do
    visit dvd_reports_path(as: $admin_user)
    # month totals by vendor
    # month totals
    # vendor totals
    # ultimate total
  end

end
