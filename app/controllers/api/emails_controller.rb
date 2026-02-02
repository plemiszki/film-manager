class Api::EmailsController < AdminController

  def index
    @emails = Email.includes(:sender).recent
    if params[:report_id].present?
      @emails = @emails.where("metadata->'report_ids' @> ?", [params[:report_id].to_i].to_json)
    end
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

end
