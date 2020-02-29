require 'rails_helper'
require 'support/features_helper'

describe 'licensors_index', type: :feature do

  before(:all) {
    Licensor.create!(name: 'Visit Films', email: 'ryan@visitfilms.com')
  }

  it 'is gated' do
    visit licensors_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all licensors' do
    visit licensors_path(as: $admin_user)
    expect(page).to have_content 'Licensors'
    expect(page).to have_content 'Visit Films'
  end

  it 'can add new licensors' do
    visit licensors_path(as: $admin_user)
    find('.btn', text: 'Add Licensor').click
    find('[data-field="name"]').set('New Licensor')
    within('.admin-modal') do
      find('.btn[value="Add Licensor"]').click
    end
    expect(find('.admin-table')).to have_content 'New Licensor'
    expect(Licensor.last.attributes).to include(
      'name' => 'New Licensor'
    )
  end

  it 'validates new licensors properly' do
    visit licensors_path(as: $admin_user)
    find('.btn', text: 'Add Licensor').click
    within('.admin-modal') do
      find('.btn[value="Add Licensor"]').click
    end
    expect(page).to have_content "Name can't be blank"
  end

end
