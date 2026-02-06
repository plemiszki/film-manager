require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'royalty_reports_index', type: :feature do

  before do
    Sidekiq::Testing.inline!
  end

  before(:each) do
    create(:setting)
    create(:user)
    create(:label)
    create(:licensor)
    @proper_quarter, @proper_year = get_proper_quarter(Date.today)
  end

  it 'is gated' do
    visit royalty_reports_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all reports' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    create(:royalty_report, film_id: 2, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    expect(page).to have_content 'Wilby Wonderful'
    expect(page).to have_content 'Another Film'
    expect(page).to have_content 'Hippo Entertainment'
  end

  it 'imports revenue' do
    create_revenue_streams
    film = create(:expenses_recouped_from_top_film)
    film.film_revenue_percentages.update_all(value: 50)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_btn("Import")
    click_btn('Import Revenue')
    find('form input[type="file"]', visible: false).set('spec/support/revenue.xlsx')
    expect(page).to have_content 'Import Complete'
    expect(RoyaltyReport.count).to eq(1)
  end

  it 'imports expenses' do
    create_revenue_streams
    film = create(:expenses_recouped_from_top_film)
    film.film_revenue_percentages.update_all(value: 50)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_btn("Import")
    click_btn('Import Expenses')
    find('form input[type="file"]', visible: false).set('spec/support/expenses.xlsx')
    expect(page).to have_content 'Import Complete'
    expect(RoyaltyReport.count).to eq(1)
  end

  it "filters reports by when they're due" do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    create(:royalty_report, film_id: 2, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('select.days-filter', '30 days')
    expect(page).to have_content 'Wilby Wonderful'
    expect(page).to have_no_content 'Another Film'
  end

  it 'starts calculate totals job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_btn("Totals")
    expect(page).to have_content 'Calculating Totals'
  end

  it 'starts create report summary job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_btn("Summary")
    expect(page).to have_content 'Creating Summary'
  end

  it 'starts error check job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_btn("Error Check")
    expect(page).to have_content 'Checking For Errors'
  end

  it 'starts export all reports job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('select.days-filter', '30 days')
    click_btn("Export All")
    expect(page).to have_content('Exporting Reports', wait: 10)
  end

  it 'starts export and send reports job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('select.days-filter', '30 days')
    click_btn('Send All')
    confirm
    expect(page).to have_content 'Exporting Reports'
  end

end
