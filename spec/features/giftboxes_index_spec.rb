require 'rails_helper'
require 'support/features_helper'

describe 'giftboxes_index', type: :feature do

  before(:each) do
    @giftbox = create(:giftbox)
  end

  it 'is gated' do
    visit giftboxes_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all invoices' do
    visit giftboxes_path(as: $admin_user)
    expect(page).to have_content 'Beyond Borders'
  end

  it 'adds giftboxes' do
    visit giftboxes_path(as: $admin_user)
    click_btn('Add Giftbox')
    info = {
      name: 'Faces of Israel',
      upc: '857692005024'
    }
    fill_out_and_submit_modal(info, :input)
    verify_db(
      entity: Giftbox.last,
      data: info
    )
    expect(page).to have_content('Faces of Israel')
  end

  it 'validates new giftboxes' do
    visit giftboxes_path(as: $admin_user)
    click_btn('Add Giftbox')
    fill_out_and_submit_modal({}, :input)
    expect(page).to have_content("Name can't be blank")
    expect(page).to have_content("Upc can't be blank")
  end

end
