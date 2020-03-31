FactoryBot.define do

  factory :setting do
    booking_confirmation_text { 'booking confirmation text' }
    next_dvd_invoice_number { 1 }
    next_booking_invoice_number { 1 }
    dvd_invoice_email_text { 'dvd invoice email text' }
    paid_booking_invoice_email_text { 'paid booking invoice email text' }
    partially_paid_booking_invoice_email_text { 'partially paid booking invoice email text' }
    unpaid_overage_booking_invoice_email_text { 'unpaid overage booking invoice email text' }
    unpaid_non_overage_booking_invoice_email_text { 'unpaid non-overage booking invoice email text' }
    booking_invoice_payment_info_email_text { 'booking invoice payment info email text' }
    shipping_terms_email_text { 'shipping terms email text' }
    all_booking_invoices_email_text { 'all booking invoices email text' }
  end

end
