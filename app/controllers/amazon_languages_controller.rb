class AmazonLanguagesController < AdminController

  def show
    @amazon_language = AmazonLanguage.find_by(id: params[:id])
    render 'show', formats: [:html], handlers: [:erb]
  end

end
