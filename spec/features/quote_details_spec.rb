require 'rails_helper'
require 'support/features_helper'

describe 'quote_details', type: :feature do

  before(:each) do
    create(:label)
    create(:film)
    @quote = create(:quote)
  end

  it 'is gated' do
    visit quote_path(@quote)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the quote' do
    visit quote_path(@quote, as: $admin_user)
    wait_for_ajax
    expect(find('textarea[data-field="text"]').value).to eq 'This is the greatest film in history.'
    expect(find('input[data-field="author"]').value).to eq 'Roger Ebert'
    expect(find('input[data-field="publication"]').value).to eq 'Chicago Sun'
  end

  it 'updates information about the quote' do
    visit quote_path(@quote, as: $admin_user)
    new_quote_info = {
      text: 'It stinks.',
      author: 'Jay Sherman',
      publication: 'Duke Publications'
    }
    fill_out_form(new_quote_info)
    save_and_wait
    verify_db_and_component(
      entity: @quote,
      data: new_quote_info
    )
  end

  it 'validates information about the quote' do
    visit quote_path(@quote, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Text can't be blank")
  end

  it 'deletes the quote' do
    visit quote_path(@quote, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path("/films/#{@quote.film.id}", ignore_query: true)
    expect(Quote.find_by_id(@quote.id)).to be(nil)
  end

end
