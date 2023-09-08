require 'rails_helper'
require 'support/features_helper'

describe 'amazon_language_details', type: :feature do

  before(:each) do
    create(:setting)
    @amazon_language = create(:amazon_language)
  end

  it 'is gated' do
    visit amazon_language_path(@amazon_language)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the amazon language' do
    visit amazon_language_path(@amazon_language, as: $admin_user)
    wait_for_ajax
    expect(find('input[data-field="name"]').value).to eq('English (UK)')
  end

  it 'updates information about the amazon language' do
    visit amazon_language_path(@amazon_language, as: $admin_user)
    new_info = {
      name: 'English (US)'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @amazon_language,
      data: new_info,
    )
  end

  it 'validates information about the amazon language' do
    visit amazon_language_path(@amazon_language, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the amazon language' do
    visit amazon_language_path(@amazon_language, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(AmazonLanguage.find_by_id(@amazon_language.id)).to be(nil)
  end

end
