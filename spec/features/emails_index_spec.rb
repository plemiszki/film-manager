require 'rails_helper'
require 'support/features_helper'

describe 'emails_index', type: :feature do

  before(:each) do
    create(:email,
      email_type: 'statement',
      recipient: 'licensor@example.com',
      status: :delivered,
      sent_at: Time.zone.parse('2025-06-15 10:30:00'),
      metadata: { 'quarter' => 2, 'year' => 2025 },
    )
  end

  it 'is gated' do
    visit emails_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all emails' do
    visit emails_path(as: $admin_user)
    expect(page).to have_content 'Emails'
    expect(page).to have_content 'Statements - Q2 2025'
    expect(page).to have_content 'Peter Lemiszki'
    expect(page).to have_content 'licensor@example.com'
    expect(page).to have_content '2025-06-15 10:30:00'
    expect(page).to have_content 'Delivered'
  end

end
