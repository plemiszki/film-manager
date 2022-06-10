require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'return_details', type: :feature do

  before(:each) do
    create_dvd_types
    @return = create(:return)
    create(:dvd_customer)
    create(:dvd_customer, name: 'DVD Customer 2', sage_id: 'Sage ID 2')
    create(:label)
    @film = create(:film, title: 'Film 1')
    create(:dvd, feature_film_id: @film.id)
  end

  it 'is gated' do
    visit return_path(@return)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the return' do
    visit return_path(@return, as: $admin_user)
    expect(page).to have_content 'Return Details'
    expect(find('input[data-field="number"]').value).to eq '012345678'
    expect(find('select[data-field="customerId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="date"]').value).to eq Date.today.to_s
  end

  it 'updates information about the return' do
    visit return_path(@return, as: $admin_user)
    fill_out_form({
      customerId: { value: 2, type: :select },
      number: 'new number',
      date: '2020-01-01'
    })
    save_and_wait
    expect(@return.reload.attributes).to include(
      'customer_id' => 2,
      'number' => 'new number',
      'date' => Date.parse('2020-01-01')
    )
  end

  it 'validates information about the return' do
    visit return_path(@return, as: $admin_user)
    fill_out_form({
      number: '',
      date: ''
    })
    save_and_wait
    expect(page).to have_content("Number can't be blank")
    expect(page).to have_content("Date can't be blank")
  end

  it 'deletes the return' do
    visit return_path(@return, as: $admin_user)
    delete_button = find('.delete-button', text: 'Delete')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/returns', ignore_query: true)
    expect(Return.find_by_id(@return.id)).to be(nil)
  end

  it 'adds items to the return' do
    visit return_path(@return, as: $admin_user)
    find('.blue-outline-button', text: 'Add Item').click
    select_from_modal('Film 1')
    within('.qty-modal') do
      find('.orange-button').click
    end
    expect(page).to have_no_css('.spinner')
    expect(@return.reload.return_items.length).to eq(1)
    expect(@return.reload.return_items.first.return_id).to eq(1)
    expect(page).to have_content('Film 1')
    expect(page).to have_content('7.99')
  end

  it 'removes items from the return' do
    create(:return_item)
    visit return_path(@return, as: $admin_user)
    find('.x-button').click
    expect(page).to have_no_css('.spinner')
    expect(@return.reload.return_items.length).to eq(0)
  end

  it 'starts the export job' do
    create(:return_item)
    visit return_path(@return, as: $admin_user)
    wait_for_ajax
    find('.orange-button', text: 'Generate and Send Credit Memo').click
    expect(page).to have_content('Generating Credit Memo')
  end

  it 'generates the credit memo', :type => 'sidekiq' do
    create(:setting)
    create(:return_item)
    Sidekiq::Testing.inline! do
      visit return_path(@return, as: $admin_user)
      find('.orange-button', text: 'Generate and Send Credit Memo').click
      expect(page).to have_no_css('.spinner', wait: 10)
      expect(page).to have_content('Credit Memo Sent Successfully')
      expect(page).to have_content("Credit Memo #{CreditMemo.last.number} was sent")
      expect(CreditMemo.count).to eq(1)
      expect(CreditMemoRow.count).to eq(1)
      expect(CreditMemo.last.return_number).to eq(@return.number)
    end
  end

end
