require 'rails_helper'
require 'support/features_helper'

describe 'venues_index', type: :feature do

  before(:each) do
    Venue.create!(label: 'Film at Lincoln Center', venue_type: 'Theater')
  end

  it 'is gated' do
    visit venues_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all venues' do
    visit venues_path(as: $admin_user)
    expect(page).to have_content 'Venues'
    expect(page).to have_content 'Film at Lincoln Center'
  end

  it 'adds new venues' do
    visit venues_path(as: $admin_user)
    find('.btn', text: 'Add Venue').click
    find('[data-field="label"]').set('New Venue')
    find('[data-field="sageId"]').set('foo')
    within('.admin-modal') do
      find('input[type="submit"]').click
    end
    expect(find('.admin-table')).to have_content 'New Venue'
    expect(Venue.last.attributes).to include(
      'label' => 'New Venue',
      'sage_id' => 'foo',
      'venue_type' => 'Theater'
    )
  end

  it 'validates new venues' do
    visit venues_path(as: $admin_user)
    find('.btn', text: 'Add Venue').click
    within('.admin-modal') do
      find('input[type="submit"]').click
    end
    expect(page).to have_content "Label can't be blank"
  end

end
