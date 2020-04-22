require 'rails_helper'
require 'support/features_helper'

describe 'territories_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:territory)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all territories' do
    visit setting_path(as: $admin_user)
    within('#territories-index') do
      expect(page).to have_content 'USA'
    end
  end

  it 'adds territories' do
    visit setting_path(as: $admin_user)
    within('#territories-index') do
      find('.btn', text: 'Add Territory').click
    end
    info = { name: 'Canada' }
    fill_out_and_submit_modal(info, :input)
    verify_db({
      entity: Territory.last,
      data: info
    })
    within('#territories-index') do
      expect(page).to have_content('Canada')
    end
  end

  it 'validates territories' do
    visit setting_path(as: $admin_user)
    within('#territories-index') do
      find('.btn', text: 'Add Territory').click
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
