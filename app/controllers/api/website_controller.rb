class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(:label, :directors, :actors, :laurels, :quotes, :related_films, dvds: [:dvd_type, :dvd_shorts])
    render "films.json.jbuilder"
  end

end
