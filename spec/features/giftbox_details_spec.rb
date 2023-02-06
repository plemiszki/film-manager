require 'rails_helper'
require 'support/features_helper'

describe 'giftbox_details', type: :feature do

  before(:each) do
    @giftbox = create(:giftbox)
  end

  it 'is gated' do
    visit giftbox_path(@giftbox)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the giftbox' do
    visit giftbox_path(@giftbox, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('Beyond Borders')
    expect(find('input[data-field="upc"]').value).to eq('857692005017')
    expect(find('input[data-field="msrp"]').value).to eq('$39.95')
    expect(find('input[data-field="onDemand"]', visible: false).value).to eq('f')
    expect(find('input[data-field="quantity"]').value).to eq('100')
    expect(find('input[data-field="sageId"]').value).to eq('BEYOND BORDERS')
  end

  it 'updates information about the giftbox' do
    visit giftbox_path(@giftbox, as: $admin_user)
    new_info = {
      name: 'new name',
      upc: 'new upc',
      msrp: 49.95,
      on_demand: { value: true, type: :switch },
      sage_id: 'new sage id'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @giftbox,
      data: new_info,
      db_data: { on_demand: true },
      component_data: { msrp: '$49.95' }
    )
  end

  it 'validates information about the giftbox' do
    visit giftbox_path(@giftbox, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
    expect(page).to have_content("Upc can't be blank")
    expect(page).to have_content("Msrp is not a number")
  end

  it 'deletes the giftbox' do
    visit giftbox_path(@giftbox, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/giftboxes', ignore_query: true)
    expect(Giftbox.find_by_id(@giftbox.id)).to be(nil)
  end

  it 'lists dvds' do
    create(:label)
    create(:film)
    create(:dvd)
    create(:giftbox_dvd)
    visit giftbox_path(@giftbox, as: $admin_user)
    expect(page).to have_content('Wilby Wonderful')
  end

  it 'adds dvds' do
    create(:label)
    create(:film)
    create(:dvd)
    create_dvd_types
    visit giftbox_path(@giftbox, as: $admin_user)
    expect(page).to have_no_css('.spinner')
    click_btn('Add DVD')
    select_from_modal('Wilby Wonderful - Retail')
    expect(page).to have_content('Wilby Wonderful')
  end

  it 'removes dvds' do
    create(:label)
    create(:film)
    create(:dvd)
    create(:giftbox_dvd)
    create_dvd_types
    visit giftbox_path(@giftbox, as: $admin_user)
    find('.x-gray-circle').click
    expect(page).to have_no_css('.spinner')
    expect(GiftboxDvd.count).to be(0)
    expect(page).to have_no_content('Wilby Wonderful')
  end

end
