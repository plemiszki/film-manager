require 'rails_helper'
require 'support/features_helper'

describe 'institution_order_details', type: :feature do

  before(:each) do
    create(:institution)
    create(:institution, label: 'Columbia University', sage_id: 'COLUMBIA')
    @institution_order = create(:institution_order)
  end

  it 'is gated' do
    visit institution_order_path(@institution_order)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the institution_order' do
    visit institution_order_path(@institution_order, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Educational Order Details'

    expect(find('select[data-field="institutionId"]', visible: false).value).to eq '1'
    expect(find('input[data-field="number"]').value).to eq '1000'
    expect(find('input[data-field="orderDate"]').value).to eq '1/3/2024'

    expect(find('input[data-field="billingName"]').value).to eq 'Harvard University'
    expect(find('input[data-field="billingAddress1"]').value).to eq 'Massachusetts Hall'
    expect(find('input[data-field="billingAddress2"]').value).to eq ''
    expect(find('input[data-field="billingCity"]').value).to eq 'Cambridge'
    expect(find('input[data-field="billingState"]').value).to eq 'MA'
    expect(find('input[data-field="billingZip"]').value).to eq '02138'
    expect(find('input[data-field="billingCountry"]').value).to eq 'USA'

    expect(find('input[data-field="shippingName"]').value).to eq 'Harvard University'
    expect(find('input[data-field="shippingAddress1"]').value).to eq '200 Harvard Yard Mail Center'
    expect(find('input[data-field="shippingAddress2"]').value).to eq '1 Oxford Street'
    expect(find('input[data-field="shippingCity"]').value).to eq 'Cambridge'
    expect(find('input[data-field="shippingState"]').value).to eq 'MA'
    expect(find('input[data-field="shippingZip"]').value).to eq '02138'
    expect(find('input[data-field="shippingCountry"]').value).to eq 'USA'

    expect(find('select[data-field="licensedRights"]', visible: false).value).to eq 'drl'
    expect(find('input[data-field="price"]').value).to eq '$500.00'
    expect(find('input[data-field="shippingFee"]').value).to eq '$15.00'

    expect(find('textarea[data-field="notes"]').value).to eq 'order notes'
  end

  it 'updates information about the institution_order' do
    visit institution_order_path(@institution_order, as: $admin_user)
    new_info = {
      institution_id: { label: 'Columbia', type: :select },
      number: '2000',
      order_date: "2/1/24",
      billing_name: 'Billing Name',
      billing_address_1: 'Billing Address 1',
      billing_address_2: 'Billing Address 2',
      billing_city: 'Billing City',
      billing_state: 'Billing State',
      billing_zip: '90210',
      billing_country: 'USA',
      shipping_name: 'Shipping Name',
      shipping_address_1: 'Shipping Address 1',
      shipping_address_2: 'Shipping Address 2',
      shipping_city: 'Shipping City',
      shipping_state: 'Shipping State',
      shipping_zip: '90210',
      shipping_country: 'USA',
      licensed_rights: { label: 'PPR and DRL', type: :select },
      price: "200",
      shipping_fee: "20",
      materials_sent: "4/15/24",
      tracking_number: "12345",
      notes: 'new notes',
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @institution_order,
      data: new_info,
      db_data: {
        institution_id: 2,
        order_date: Date.new(2024, 2, 1),
        materials_sent: Date.new(2024, 4, 15),
        shipping_fee: 20,
        price: 200,
        licensed_rights: "ppr_and_drl",
      },
      component_data: {
        institution_id: "2",
        licensed_rights: "ppr_and_drl",
        order_date: "2/1/2024",
        price: "$200.00",
        shipping_fee: "$20.00",
        materials_sent: "4/15/2024",
      },
    )
  end

  it 'validates information about the institution_order' do
    visit institution_order_path(@institution_order, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Order date can't be blank")
    fill_out_form({
      order_date: 'asdf',
      materials_sent: 'asdf',
    })
    save_and_wait
    expect(page).to have_content("Order date is not a valid date")
    expect(page).to have_content("Materials sent is not a valid date")
  end

  it 'deletes institution_orders' do
    visit institution_order_path(@institution_order, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/institution_orders', ignore_query: true)
    expect(InstitutionOrder.find_by_id(@institution_order.id)).to be(nil)
  end

  it 'adds films to the order' do
    create(:label)
    create(:film)
    visit institution_order_path(@institution_order, as: $admin_user)
    click_btn('Add Film')
    select_from_modal('Wilby Wonderful')
    wait_for_ajax
    expect(@institution_order.reload.order_films.length).to eq(1)
    expect(@institution_order.reload.order_films.first.film_id).to eq(1)
    expect(page).to have_content('Wilby Wonderful')
  end

  it 'removes films from the order' do
    create(:label)
    create(:film)
    create(:institution_order_film)
    visit institution_order_path(@institution_order, as: $admin_user)
    wait_for_ajax
    find('.x-gray-circle').click
    wait_for_ajax
    expect(@institution_order.reload.order_films.length).to eq(0)
  end

end
