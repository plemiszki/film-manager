class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(:label, :countries, :languages, :genres, :topics, :directors, :actors, :laurels, :quotes, :related_films, dvds: [:dvd_type, :dvd_shorts]).order(:id)
    render "films.json.jbuilder"
  end

end
