require 'rails_helper'
require 'support/features_helper'

describe 'alias_details', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    create(:label)
    @film = create(:film)
    @another_film = create(:film, title: 'Another Film')
    @alias = Alias.create!(text: 'Foo', film: @film)
  end

  it 'is gated' do
    visit alias_path(@alias)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the alias' do
    visit alias_path(@alias, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="text"]').value).to eq 'Foo'
    expect(find('input[data-field="filmId"]').value).to eq 'Wilby Wonderful'
  end

  it 'updates information about the alias' do
    visit alias_path(@alias, as: $admin_user)
    wait_for_ajax
    fill_out_form({
      text: 'Another Alias',
      film_id: { value: 'Another Film', type: :select_modal },
    })
    save_and_wait
    expect(@alias.reload.attributes).to include(
      'text' => 'Another Alias',
      'film_id' => 2,
    )
  end

  it 'deletes the alias' do
    visit alias_path(@alias, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/aliases', ignore_query: true)
    expect(Alias.find_by_id(@alias.id)).to be(nil)
  end

end
