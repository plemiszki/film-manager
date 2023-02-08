require 'rails_helper'
require 'support/features_helper'

describe 'language_details', type: :feature do

  before(:each) do
    create(:setting)
    @language = create(:language)
  end

  it 'is gated' do
    visit language_path(@language)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the language' do
    visit language_path(@language, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('French')
  end

  it 'updates information about the language' do
    visit language_path(@language, as: $admin_user)
    new_info = {
      name: 'Spanish'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @language,
      data: new_info
    )
  end

  it 'validates information about the language' do
    visit language_path(@language, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the language' do
    visit language_path(@language, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Language.find_by_id(@language.id)).to be(nil)
  end

end
