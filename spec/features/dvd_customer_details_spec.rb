require 'rails_helper'
require 'support/features_helper'

describe 'dvd_customer_details', type: :feature do

  before(:each) do
    @dvd_customer = DvdCustomer.create!(
      name: 'DVD Customer',
      sage_id: 'Sage ID',
      payment_terms: 'payment terms',
      invoices_email: 'invoices@dvdcustomer.com',
      credit_memo_email: 'creditmemos@dvdcustomer.com',
      discount: 50,
      billing_name: 'Billing Name',
      address1: 'Address 1',
      address2: 'Address 2',
      city: 'City',
      state: 'MA',
      zip: '01778',
      country: 'Country',
      consignment: false,
      notes: 'notes',
      nickname: 'nickname'
    )
  end

  it 'is gated' do
    visit dvd_customer_path(@dvd_customer)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'DVD Customer Details'
    expect(find('input[data-field="name"]').value).to eq 'DVD Customer'
    expect(find('input[data-field="discount"]').value).to eq '50.0'
    expect(find('input[data-field="invoicesEmail"]').value).to eq 'invoices@dvdcustomer.com'
    expect(find('input[data-field="creditMemoEmail"]').value).to eq 'creditmemos@dvdcustomer.com'
    expect(find('input[data-field="sageId"]').value).to eq 'Sage ID'
    expect(find('input[data-field="paymentTerms"]').value).to eq 'payment terms'
    expect(find('input[data-field="billingName"]').value).to eq 'Billing Name'
    expect(find('input[data-field="address1"]').value).to eq 'Address 1'
    expect(find('input[data-field="address2"]').value).to eq 'Address 2'
    expect(find('input[data-field="city"]').value).to eq 'City'
    expect(find('input[data-field="state"]').value).to eq 'MA'
    expect(find('input[data-field="zip"]').value).to eq '01778'
    expect(find('input[data-field="country"]').value).to eq 'Country'
    expect(find('input[data-field="nickname"]').value).to eq 'nickname'
    expect(find('textarea[data-field="notes"]').value).to eq 'notes'
    expect(find('input[data-field="consignment"]', visible: false).checked?).to eq false
    expect(find('input[data-field="includeInTitleReport"]', visible: false).checked?).to eq false
  end

  it 'updates information about a non-consignment dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    info = {
      name: 'new name',
      sage_id: 'new sage id',
      payment_terms: 'new payment terms',
      invoices_email: 'newinvoices@dvdcustomer.com',
      credit_memo_email: 'newcreditmemos@dvdcustomer.com',
      discount: 25,
      billing_name: 'New Billing Name',
      address1: 'New Address 1',
      address2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country',
      consignment: { value: false, type: :switch },
      notes: 'new notes',
      include_in_title_report: { value: true, type: :switch },
      nickname: 'new nickname'
    }
    fill_out_form(info)
    save_and_wait
    verify_db_and_component(
      entity: @dvd_customer,
      data: info,
      component_data: { discount: '25.0' },
    )
  end

  it 'updates information about a consignment dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    info = {
      name: 'new name',
      discount: 25,
      billing_name: 'New Billing Name',
      address1: 'New Address 1',
      address2: 'New Address 2',
      city: 'New City',
      state: 'NY',
      zip: '10001',
      country: 'New Country',
      consignment: { value: true, type: :switch },
      notes: 'new notes',
      include_in_title_report: { value: true, type: :switch },
      nickname: 'new nickname'
    }
    fill_out_form(info)
    save_and_wait
    verify_db_and_component(
      entity: @dvd_customer,
      data: info,
      component_data: { discount: '25.0' },
    )
  end

  it 'validates information about a dvd customer' do
    visit dvd_customer_path(@dvd_customer, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
    expect(page).to have_content("Invoices email can't be blank")
    expect(page).to have_content("Sage can't be blank")
    expect(page).to have_content("Payment terms can't be blank")
    expect(page).to have_content("Billing name can't be blank")
    expect(page).to have_content("Address1 can't be blank")
    expect(page).to have_content("City can't be blank")
    expect(page).to have_content("Zip can't be blank")
    expect(page).to have_content("Country can't be blank")
  end

end
