class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(:label, :directors, :actors, :laurels, :quotes, :related_films)
    render "films.json.jbuilder"
  end

end
