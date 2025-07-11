require 'rails_helper'
require 'support/features_helper'
require 'sidekiq/testing'

describe 'return_details', type: :feature do

  before do
    WebMock.disable!
    Sidekiq::Testing.inline!
  end

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
    wait_for_ajax
    expect(page).to have_content 'Return Details'
    expect(find('input[data-field="number"]').value).to eq '012345678'
    expect(find('select[data-field="customerId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="date"]').value).to eq Date.today.strftime("%-m/%-d/%Y")
  end

  it 'updates information about the return' do
    visit return_path(@return, as: $admin_user)
    fill_out_form({
      customerId: { value: 2, type: :select },
      number: 'new number',
      date: '1/30/2020'
    })
    save_and_wait
    expect(@return.reload.attributes).to include(
      'customer_id' => 2,
      'number' => 'new number',
      'date' => Date.parse('2020-01-30')
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
    click_delete_and_confirm
    expect(page).to have_current_path('/returns', ignore_query: true)
    expect(Return.find_by_id(@return.id)).to be(nil)
  end

  it 'adds items to the return' do
    visit return_path(@return, as: $admin_user)
    click_btn('Add Item')
    select_from_modal('Film 1')
    within('.content') do
      click_btn('OK', :submit)
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
    find('.x-gray-circle').click
    expect(page).to have_no_css('.spinner')
    expect(@return.reload.return_items.length).to eq(0)
  end

  it 'starts the export job' do
    create(:return_item)
    visit return_path(@return, as: $admin_user)
    wait_for_ajax
    click_btn('Generate and Send Credit Memo')
    expect(page).to have_content('Generating Credit Memo')
  end

  it 'generates the credit memo', :type => 'sidekiq' do
    create(:setting)
    create(:return_item)
    visit return_path(@return, as: $admin_user)
    click_btn('Generate and Send Credit Memo')
    expect(page).to have_no_css('.spinner', wait: 10)
    expect(page).to have_content('Credit Memo Sent Successfully')
    expect(page).to have_content("Credit Memo #{CreditMemo.last.number} was sent")
    expect(CreditMemo.count).to eq(1)
    expect(CreditMemoRow.count).to eq(1)
    expect(CreditMemo.last.return_number).to eq(@return.number)
  end

end
