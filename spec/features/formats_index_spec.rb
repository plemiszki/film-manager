require 'rails_helper'
require 'support/features_helper'

describe 'formats_index', type: :feature do

  before(:each) do
    create(:setting)
    create(:format)
  end

  it 'is gated' do
    visit setting_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all formats' do
    visit setting_path(as: $admin_user)
    within('#formats-index') do
      expect(page).to have_content '35mm'
    end
  end

  it 'adds formats' do
    visit setting_path(as: $admin_user)
    within('#formats-index') do
      find('.btn', text: 'Add Format').click
    end
    info = { name: 'Digibeta' }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Format.last,
      data: info
    )
    within('#formats-index') do
      expect(page).to have_content('Digibeta')
    end
  end

  it 'validates formats' do
    visit setting_path(as: $admin_user)
    within('#formats-index') do
      find('.btn', text: 'Add Format').click
    end
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
  end

end
