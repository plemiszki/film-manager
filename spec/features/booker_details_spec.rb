require 'rails_helper'
require 'support/features_helper'

describe 'booker_details', type: :feature do

  before(:each) do
    @booker = Booker.create!(name: 'Joe Booker', email: 'joe@somewhere.com', phone: '555-555-5555')
    @venue = Venue.create!(label: 'Some Theater', venue_type: 'Theater')
  end

  it 'is gated' do
    visit booker_path(@booker)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the booker' do
    visit booker_path(@booker, as: $admin_user)
    expect(page).not_to have_selector('.spinner')
    expect(find('input[data-field="name"]').value).to eq 'Joe Booker'
    expect(find('input[data-field="email"]').value).to eq 'joe@somewhere.com'
    expect(find('input[data-field="phone"]').value).to eq '555-555-5555'
  end

  it 'updates information about the booker' do
    visit booker_path(@booker, as: $admin_user)
    expect(page).not_to have_selector('.spinner')
    fill_out_form({
      name: { value: 'New Name' },
      email: { value: 'newemail@somewhere.com' },
      phone: { value: '222-222-2222' }
    })
    save_and_wait
    expect(@booker.reload.attributes).to include(
      'name' => 'New Name',
      'email' => 'newemail@somewhere.com',
      'phone' => '222-222-2222'
    )
  end

  it 'adds venues' do
    visit booker_path(@booker, as: $admin_user)
    find('.blue-outline-button', text: 'Add Venue').click
    select_from_modal('Some Theater')
    expect(BookerVenue.last.attributes).to include(
      'booker_id' => @booker.id,
      'venue_id' => @venue.id
    )
  end

  it 'removes venues' do
    BookerVenue.create(booker_id: @booker.id, venue_id: @venue.id)
    visit booker_path(@booker, as: $admin_user)
    within('.standard-list') do
      find('.x-button').click
    end
    expect(page).not_to have_selector('.spinner')
    expect(BookerVenue.count).to eq(0)
  end

  it 'deletes the booker' do
    visit booker_path(@booker, as: $admin_user)
    delete_button = find('.orange-button', text: 'Delete Booker')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/bookers', ignore_query: true)
    expect(Booker.find_by_id(@booker.id)).to be(nil)
  end

end
