require 'rails_helper'
require 'support/features_helper'

describe 'jobs_index', type: :feature do

  before(:each) do
    create(:user)
  end

  it 'displays all running reports export jobs' do
    timestamp = Time.now.to_s
    create(:job, current_value: 25, job_id: timestamp)
    visit royalty_reports_path(as: $admin_user)
    wait_for_ajax
    sleep 1
    within all('#jobs-index')[1] do
      expect(page).to have_content(timestamp)
      expect(page).to have_content('25 / 100')
    end
  end

  it 'does not display completed jobs' do
    create(:job, status: :success)
    visit royalty_reports_path(as: $admin_user)
    wait_for_ajax
    expect(page).to have_no_css('#jobs-index')
  end

  it 'does not display killed jobs' do
    create(:job, status: :killed)
    visit royalty_reports_path(as: $admin_user)
    wait_for_ajax
    expect(page).to have_no_css('#jobs-index')
  end

  it 'kills jobs' do
    create(:job)
    visit royalty_reports_path(as: $admin_user)
    sleep 2
    within all('#jobs-index')[1] do
      click_btn("Kill Job")
    end
    expect(page).to have_no_css('.spinner')
    expect(page).to have_no_css('#jobs-index')
    expect(Job.last.attributes['status']).to eq('killed')
  end

end
