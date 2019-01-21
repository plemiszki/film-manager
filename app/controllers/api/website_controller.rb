class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(:formats, :licensor, :countries, :languages, :genres, :topics, :directors, :actors, :laurels, :quotes, :related_films, dvds: [:dvd_type, :dvd_shorts], digital_retailer_films: [:digital_retailer], episodes: [:actors]).order(:id)
    render 'films.json.jbuilder'
  end

  def gift_boxes
    @gift_boxes = Giftbox.where(on_demand: false).includes(:dvds)
    render 'gift_boxes.json.jbuilder'
  end

  def bookings
    @in_theaters = InTheatersFilm.where(section: 'In Theaters').includes(:film).order(:order)
    @coming_soon = InTheatersFilm.where(section: 'Coming Soon').includes(:film).order(:order)
    @repertory = InTheatersFilm.where(section: 'Repertory').includes(:film).order(:order)
    render 'bookings.json.jbuilder'
  end

end
