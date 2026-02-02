class Api::EmailsController < AdminController

  def index
    @emails = Email.includes(:sender).recent
    if params[:report_id].present?
      @emails = @emails.where("metadata->'report_ids' @> ?", [params[:report_id].to_i].to_json)
    end
    if params[:licensor_id].present?
      @emails = @emails.where("metadata->>'licensor_id' = ?", params[:licensor_id].to_s)
    end
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

end
