require 'rails_helper'
require 'support/features_helper'

describe 'merchandise_details', type: :feature do

  before :each do
    create(:label)
    create(:film)
    create(:merchandise_type)
    @merchandise_item = create(:merchandise_item)
  end

  it 'is gated' do
    visit merchandise_item_path(@merchandise_item)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the merchandise item' do
    visit merchandise_item_path(@merchandise_item, as: $admin_user)
    expect(page).to have_content 'Merchandise Details'
    expect(find('input[data-field="name"]').value).to eq "Film Movement Women's T-shirt"
    expect(find('select[data-field="merchandiseTypeId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="description"]').value).to eq '100% certified organic cotton T-Shirt with Film Movement logo'
    expect(find('input[data-field="size"]').value).to eq 'Small'
    expect(find('input[data-field="price"]').value).to eq '$19.95'
    expect(find('input[data-field="inventory"]').value).to eq '10'
    expect(find('input[data-field="filmId"]').value).to eq 'Wilby Wonderful'
  end

  it 'updates information about the merchandise item' do
    create(:merchandise_type, name: 'Poster')
    create(:film, title: 'A Screaming Man')
    visit merchandise_item_path(@merchandise_item, as: $admin_user)
    new_info = {
      name: 'A Screaming Man Poster',
      merchandise_type_id: { value: 2, type: :select },
      description: 'a cool poster',
      size: 'Large',
      price: '$20.00',
      inventory: 50,
      film_id: { value: 'A Screaming Man', type: :select_modal_old }
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component({
      entity: @merchandise_item,
      data: new_info,
      db_data: { price: 20, film_id: 2 }
    })
  end

  it 'validates information about the merchandise item' do
    visit merchandise_item_path(@merchandise_item, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
    expect(page).to have_content('Price is not a number')
    expect(page).to have_content('Inventory is not a number')
  end

  it 'deletes the merchandise item' do
    visit merchandise_item_path(@merchandise_item, as: $admin_user)
    delete_button = find('.orange-button', text: 'Delete Merchandise')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/merchandise_items', ignore_query: true)
    expect(MerchandiseItem.find_by_id(@merchandise_item.id)).to be(nil)
  end

end
