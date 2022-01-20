require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'royalty_reports_index', type: :feature do

  before(:each) do
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
    Sidekiq::Testing.inline! do
      visit royalty_reports_path(as: $admin_user, no_jobs: true)
      wait_for_ajax
      find('.btn', text: 'Import').click
      find('.orange-button', text: 'Import Revenue').click
      find('form input[type="file"]', visible: false).set('spec/support/revenue.xlsx')
      expect(page).to have_content 'Import Complete'
    end
  end

  it "filters reports by when they're due" do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    create(:royalty_report, film_id: 2, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('#days-filter', '30 days')
    expect(page).to have_content 'Wilby Wonderful'
    expect(page).to have_no_content 'Another Film'
  end

  it 'starts calculate totals job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    find('.btn', text: 'Totals').click
    expect(page).to have_content 'Calculating Totals'
  end

  it 'starts create report summary job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    find('.btn', text: 'Summary').click
    expect(page).to have_content 'Creating Summary'
  end

  it 'starts error check job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    find('.btn', text: 'Error Check').click
    expect(page).to have_content 'Checking For Errors'
  end

  it 'starts export all reports job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('#days-filter', '30 days')
    find('.btn', text: 'Export All').click
    expect(page).to have_content 'Exporting Reports'
  end

  it 'starts export and send reports job' do
    create(:film, licensor_id: 1, days_statement_due: 30)
    create(:film, title: 'Another Film', days_statement_due: 60)
    create(:royalty_report, quarter: @proper_quarter, year: @proper_year)
    visit royalty_reports_path(as: $admin_user, no_jobs: true)
    wait_for_ajax
    click_nice_select_option('#days-filter', '30 days')
    find('.btn', text: 'Send All').click
    within('.send-modal') do
      find('.orange-button', text: 'Yes').click
    end
    expect(page).to have_content 'Exporting Reports'
  end

end
