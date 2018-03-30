class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(:label, :countries, :languages, :genres, :topics, :directors, :actors, :laurels, :quotes, :related_films, dvds: [:dvd_type, :dvd_shorts]).order(:id)
    render "films.json.jbuilder"
  end

  def gift_boxes
    @gift_boxes = Giftbox.where(on_demand: false).includes(:dvds)
    render "gift_boxes.json.jbuilder"
  end

end
