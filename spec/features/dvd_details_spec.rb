require 'rails_helper'
require 'support/features_helper'

describe 'dvd_details', type: :feature do

  before(:each) do
    create(:label)
    @film = create(:film, title: 'Some Film')
    @short = create(:film, film_type: 'Short', title: 'A Short Film')
    create_dvd_types
    @dvd = Dvd.create!(
      feature_film_id: @film.id,
      dvd_type_id: DvdType.first.id,
      upc: '616892087410',
      pre_book_date: Date.parse('1/1/2000'),
      retail_date: Date.parse('1/2/2000'),
      price: 24.95,
      stock: 62,
      units_shipped: 200,
      discs: 1,
      sound_config: 'mono',
      special_features: 'director commentary'
    )
  end

  it 'is gated' do
    visit dvd_path(@dvd)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the dvd' do
    visit dvd_path(@dvd, as: $admin_user)
    expect(page).to have_content 'DVD Details'
    expect(find('select[data-field="dvdTypeId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="upc"]').value).to eq '616892087410'
    expect(find('input[data-field="preBookDate"]').value).to eq '1/1/00'
    expect(find('input[data-field="retailDate"]').value).to eq '2/1/00'
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
      repressing: true,
      discs: 2,
      soundConfig: 'stereo',
      specialFeatures: 'making of documentary'
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
      'special_features' => 'making of documentary'
    )
  end

  it 'adds shorts' do
    visit dvd_path(@dvd, as: $admin_user)
    find('.blue-outline-button', text: 'Add Short').click
    select_from_modal('A Short Film')
    expect(DvdShort.last.attributes).to include(
      'dvd_id' => @dvd.id,
      'short_id' => @short.id
    )
    expect(find('.fm-admin-table')).to have_content('A Short Film')
  end

  it 'deletes the dvd' do
    visit dvd_path(@dvd, as: $admin_user)
    delete_button = find('.orange-button', text: 'Delete DVD')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/films/1', ignore_query: true)
    expect(Dvd.find_by_id(@dvd.id)).to be(nil)
  end

end
