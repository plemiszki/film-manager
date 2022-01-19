class Api::WebsiteController < CyberController

  def films
    @films = Film.all.includes(
      :actors,
      :countries,
      :directors,
      :formats,
      :genres,
      :languages,
      :laurels,
      :licensor,
      :quotes,
      :related_films,
      :topics,
      :edu_platforms,
      digital_retailer_films: [:digital_retailer],
      dvds: [:dvd_type, :dvd_shorts],
      episodes: [:actors],
    ).order(:id)
    render 'films.json.jbuilder'
  end

  def bookings
    @in_theaters = InTheatersFilm.where(section: 'In Theaters').includes(:film).order(:order)
    @coming_soon = InTheatersFilm.where(section: 'Coming Soon').includes(:film).order(:order)
    @repertory = InTheatersFilm.where(section: 'Repertory').includes(:film).order(:order)
    render 'bookings.json.jbuilder'
  end

  def merchandise
    @merchandise_items = MerchandiseItem.all.includes(:merchandise_type)
    render 'merchandise.json.jbuilder'
  end

end
