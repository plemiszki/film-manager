require 'rails_helper'
require 'support/features_helper'

describe 'settings_details', type: :feature do

  before(:each) do
    @settings = create(:setting)
    create(:booker_user)
  end

  it 'is gated' do
    visit setting_path(@settings)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the settings' do
    visit setting_path(@settings, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Settings'
    expect(find('textarea[data-field="bookingConfirmationText"]').value).to eq 'booking confirmation text'
    expect(find('textarea[data-field="dvdInvoiceEmailText"]').value).to eq 'dvd invoice email text'
    expect(find('textarea[data-field="paidBookingInvoiceEmailText"]').value).to eq 'paid booking invoice email text'
    expect(find('textarea[data-field="partiallyPaidBookingInvoiceEmailText"]').value).to eq 'partially paid booking invoice email text'
    expect(find('textarea[data-field="unpaidOverageBookingInvoiceEmailText"]').value).to eq 'unpaid overage booking invoice email text'
    expect(find('textarea[data-field="bookingInvoicePaymentInfoEmailText"]').value).to eq 'booking invoice payment info email text'
    expect(find('textarea[data-field="shippingTermsEmailText"]').value).to eq 'shipping terms email text'
    expect(find('textarea[data-field="allBookingInvoicesEmailText"]').value).to eq 'all booking invoices email text'
    expect(find('textarea[data-field="shippingTermsEmailText"]').value).to eq 'shipping terms email text'
    expect(find('textarea[data-field="virtualBookingReportText"]').value).to eq 'virtual booking report text'
    expect(find('textarea[data-field="institutionOrderInvoiceEmailText"]').value).to eq 'institution order invoice email text'
    expect(find('input[data-field="boxOfficeRemindersUserId"]').value).to eq('Maxwell Wolkin')
    expect(find('input[data-field="paymentRemindersUserId"]').value).to eq('Maxwell Wolkin')
  end

  it 'updates information about the settings' do
    visit setting_path(@settings, as: $admin_user)
    wait_for_ajax
    new_info = {
      booking_confirmation_text: 'new booking confirmation text',
      dvd_invoice_email_text: 'new dvd invoice email text',
      paid_booking_invoice_email_text: 'new paid booking invoice email text',
      partially_paid_booking_invoice_email_text: 'new partially paid booking invoice email text',
      unpaid_overage_booking_invoice_email_text: 'new unpaid overage booking invoice email text',
      unpaid_non_overage_booking_invoice_email_text: 'new unpaid non-overage booking invoice email text',
      booking_invoice_payment_info_email_text: 'new booking invoice payment info email text',
      shipping_terms_email_text: 'new shipping terms email text',
      all_booking_invoices_email_text: 'new all booking invoices email text',
      virtual_booking_report_text: 'new virtual booking report text',
      institution_order_invoice_email_text: 'new institution order invoice email text',
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @settings,
      data: new_info
    )
  end

end
