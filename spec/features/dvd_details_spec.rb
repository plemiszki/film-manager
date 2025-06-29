require 'rails_helper'
require 'support/features_helper'

describe 'dvd_details', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    create(:label)
    @film = create(:film, title: 'Some Film')
    @short = create(:film, film_type: 'Short', title: 'A Short Film')
    create_dvd_types
    @dvd = create(:dvd)
  end

  it 'is gated' do
    visit dvd_path(@dvd)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the dvd' do
    visit dvd_path(@dvd, as: $admin_user)
    expect(page).to have_content 'DVD Details'
    wait_for_ajax
    expect(find('select[data-field="dvdTypeId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="upc"]').value).to eq '616892087410'
    expect(find('input[data-field="preBookDate"]').value).to eq '1/1/2000'
    expect(find('input[data-field="retailDate"]').value).to eq '1/2/2000'
    expect(find('input[data-field="price"]').value).to eq '$24.95'
    expect(find('input[data-field="stock"]').value).to eq '62'
    expect(find('input[data-field="unitsShipped"]').value).to eq '200'
    expect(find('input[data-field="discs"]').value).to eq '1'
    expect(find('input[data-field="soundConfig"]').value).to eq 'mono'
    expect(find('textarea[data-field="specialFeatures"]').value).to eq 'director commentary'
  end

  it 'updates information about the dvd' do
    visit dvd_path(@dvd, as: $admin_user)
    fill_out_form({
      dvdTypeId: { value: 2, type: :select },
      upc: 1234567890,
      preBookDate: '1/1/10',
      retailDate: '2/1/10',
      price: '$19.95',
      repressing: { value: true, type: :switch },
      discs: 2,
      soundConfig: 'stereo',
      specialFeatures: 'making of documentary',
      active: { value: false, type: :switch },
    })
    save_and_wait
    expect(@dvd.reload.attributes).to include(
      'dvd_type_id' => 2,
      'upc' => '1234567890',
      'pre_book_date' => Date.parse('10/1/1'),
      'retail_date' => Date.parse('10/2/1'),
      'price' => 19.95,
      'repressing' => true,
      'discs' => 2,
      'sound_config' => 'stereo',
      'special_features' => 'making of documentary',
      'active' => false,
    )
  end

  it 'adds shorts' do
    visit dvd_path(@dvd, as: $admin_user)
    click_btn("Add Short")
    select_from_modal('A Short Film')
    expect(DvdShort.last.attributes).to include(
      'dvd_id' => @dvd.id,
      'short_id' => @short.id
    )
    expect(find('table')).to have_content('A Short Film')
  end

  it 'deletes shorts' do
    @another_short = create(:film, film_type: 'Short', title: 'Another Short Film')
    create(:dvd_short, short_id: @short.id)
    create(:dvd_short, short_id: @another_short.id)
    visit dvd_path(@dvd, as: $admin_user)
    within('table') do
      find_all('.x-gray-circle').first.click
    end
    wait_for_ajax
    expect(DvdShort.count).to eq(1)
    within('table') do
      expect(page).to have_no_content("A Short Film")
      expect(page).to have_content("Another Short Film")
    end
  end

  it 'deletes the dvd' do
    visit dvd_path(@dvd, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/films/1', ignore_query: true)
    expect(Dvd.find_by_id(@dvd.id)).to be(nil)
  end

end
