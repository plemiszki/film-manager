json.settings do
  json.bookingConfirmationText @settings.booking_confirmation_text
  json.dvdInvoiceEmailText @settings.dvd_invoice_email_text
  json.creditMemoEmailText @settings.credit_memo_email_text
  json.paidBookingInvoiceEmailText @settings.paid_booking_invoice_email_text
  json.partiallyPaidBookingInvoiceEmailText @settings.partially_paid_booking_invoice_email_text
  json.unpaidOverageBookingInvoiceEmailText @settings.unpaid_overage_booking_invoice_email_text
  json.unpaidNonOverageBookingInvoiceEmailText @settings.unpaid_non_overage_booking_invoice_email_text
  json.bookingInvoicePaymentInfoEmailText @settings.booking_invoice_payment_info_email_text
  json.shippingTermsEmailText @settings.shipping_terms_email_text
  json.allBookingInvoicesEmailText @settings.all_booking_invoices_email_text
  json.boxOfficeRemindersUserId @settings.box_office_reminders_user_id || ""
  json.paymentRemindersUserId @settings.payment_reminders_user_id || ""
  json.virtualBookingReportText @settings.virtual_booking_report_text
end
json.users @users do |user|
  json.id user.id
  json.name user.name
end
