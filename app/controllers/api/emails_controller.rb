class Api::EmailsController < AdminController

  def index
    @emails = Email.includes(:sender).recent
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

end
