class Api::SettingsController < AdminController

  def show
    @settings = Setting.first
    render "show.json.jbuilder"
  end

  def update
    @settings = Setting.first
    if @settings.update(settings_params)
      render "show.json.jbuilder"
    else
      render json: @settings.errors.full_messages, status: 422
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
      :all_booking_invoices_email_text
    )
  end

end
