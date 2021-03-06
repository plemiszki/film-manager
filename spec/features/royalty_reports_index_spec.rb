require 'rails_helper'
require 'support/features_helper'

describe 'royalty_reports_index', type: :feature do

  before(:each) do
    create(:user)
    create(:label)
    create(:licensor)
    @proper_quarter, @proper_year = get_proper_quarter(Date.today)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
  end

  it 'is gated' do
    visit royalty_reports_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all reports' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, film_id: 2, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user)
    expect(page).to have_content 'Wilby Wonderful'
    expect(page).to have_content 'Another Film'
    expect(page).to have_content 'Hippo Entertainment'
  end

  it "filters reports by when they're due" do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, film_id: 2, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user)
    wait_for_ajax
    click_nice_select_option('#days-filter', '30 days')
    expect(page).to have_content 'Wilby Wonderful'
    expect(page).to have_no_content 'Another Film'
  end

end
