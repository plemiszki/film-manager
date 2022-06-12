require 'rails_helper'
require 'support/features_helper'

describe 'aliases_index', type: :feature do

  before(:each) do
    create(:label)
    @film = create(:film)
    Alias.create!(text: 'Foo', film: @film)
  end

  it 'is gated' do
    visit aliases_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays all aliases' do
    visit aliases_path(as: $admin_user)
    expect(page).to have_content 'Foo'
    expect(page).to have_content 'Wilby Wonderful'
  end

  it 'validates new aliases properly' do
    visit aliases_path(as: $admin_user)
    find('.float-button', text: 'Add Alias').click
    fill_out_and_submit_modal({
      text: ''
    }, :input)
    expect(page).to have_content "Text can't be blank"
  end

  it 'adds new aliases' do
    visit aliases_path(as: $admin_user)
    find('.float-button', text: 'Add Alias').click
    fill_out_and_submit_modal({
      text: 'Another Alias',
      film_id: { value: 'Wilby Wonderful', type: :select_modal },
    }, :input)
    wait_for_ajax
    expect(find('.admin-table')).to have_content 'Another Alias'
    expect(Alias.last.attributes).to include(
      'text' => 'Another Alias',
      'film_id' => 1,
    )
  end

end
