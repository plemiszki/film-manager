class Api::EmailsController < AdminController

  def index
    @emails = Email.includes(:sender).recent
    if params[:report_id].present?
      @emails = @emails.where("metadata->'report_ids' @> ?", [params[:report_id].to_i].to_json)
    end
    if licensor_id.present?
      @emails = @emails.where("metadata->>'licensor_id' = ?", params[:licensor_id].to_s)
    end
    if report_id || licensor_id
      @licensor_email_addresses = licensor.email_addresses
    end
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def licensor
    @licensor ||= (licensor_id ? Licensor.find(licensor_id) : RoyaltyReport.find(report_id).licensor)
  end

  def licensor_id
    @licensor_id ||= params[:licensor_id]
  end

  def report_id
    @report_id ||= params[:report_id]
  end

end
