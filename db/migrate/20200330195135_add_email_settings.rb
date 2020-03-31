class AddEmailSettings < ActiveRecord::Migration
  def change
    add_column :settings, :dvd_invoice_email_text, :string, default: ''
    add_column :settings, :paid_booking_invoice_email_text, :string, default: ''
    add_column :settings, :partially_paid_booking_invoice_email_text, :string, default: ''
    add_column :settings, :unpaid_overage_booking_invoice_email_text, :string, default: ''
    add_column :settings, :unpaid_non_overage_booking_invoice_email_text, :string, default: ''
    add_column :settings, :booking_invoice_payment_info_email_text, :string, default: ''
    add_column :settings, :shipping_terms_email_text, :string, default: ''
    add_column :settings, :all_booking_invoices_email_text, :string, default: ''
    change_column_default :settings, :next_booking_invoice_number, 1
    change_column_default :settings, :next_dvd_invoice_number, 1
    change_column_default :settings, :booking_confirmation_text, ''
  end
end
