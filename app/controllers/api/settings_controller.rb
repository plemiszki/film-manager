class Api::SettingsController < AdminController

  def show
    @settings = Setting.first
    @users = User.box_office_reminder_senders
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def update
    @settings = Setting.first
    if @settings.update(settings_params)
      @users = User.box_office_reminder_senders
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@settings)
    end
  end

  private

  def settings_params
    params[:settings].permit(
      :booking_confirmation_text,
      :dvd_invoice_email_text,
      :credit_memo_email_text,
      :paid_booking_invoice_email_text,
      :partially_paid_booking_invoice_email_text,
      :unpaid_overage_booking_invoice_email_text,
      :unpaid_non_overage_booking_invoice_email_text,
      :booking_invoice_payment_info_email_text,
      :shipping_terms_email_text,
      :all_booking_invoices_email_text,
      :box_office_reminders_user_id,
      :payment_reminders_user_id,
      :virtual_booking_report_text,
      :institution_order_invoice_email_text,
    )
  end

end
