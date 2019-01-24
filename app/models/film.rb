class Film < ActiveRecord::Base

  validates :title, :label_id, :film_type, presence: true
  validates :title, uniqueness: { scope: :film_type }
  validate :gr_percentage_tenth_decimal
  validates_numericality_of :year, :length
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :expense_cap, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :reserve_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates_numericality_of :reserve_quarters, :greater_than_or_equal_to => 0
  validates_numericality_of :auto_renew_term, :greater_than_or_equal_to => 0
  validates_numericality_of :sell_off_period, :greater_than_or_equal_to => 0
  validates_date :start_date, :end_date, :avod_release, :tvod_release, :svod_release, :club_date, :theatrical_release, allow_blank: true
  validates_uniqueness_of :club_date, allow_nil: true

  def gr_percentage_tenth_decimal
    if [5, 6].include?(deal_type_id)
      validates_numericality_of :gr_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
    end
  end

  belongs_to :licensor
  belongs_to :label
  has_many :film_revenue_percentages, dependent: :destroy
  has_many :film_rights, dependent: :destroy
  has_many :royalty_reports, dependent: :destroy
  has_many :dvds, foreign_key: :feature_film_id, dependent: :destroy
  has_many :quotes, dependent: :destroy
  has_many :laurels, dependent: :destroy
  has_many :related_films, dependent: :destroy
  has_many :directors, dependent: :destroy
  has_many :actors, as: :actorable, dependent: :destroy
  has_many :film_countries, dependent: :destroy
  has_many :film_languages, dependent: :destroy
  has_many :film_genres, dependent: :destroy
  has_many :film_topics, dependent: :destroy
  has_many :countries, through: :film_countries
  has_many :languages, through: :film_languages
  has_many :film_formats, dependent: :destroy
  has_many :formats, through: :film_formats
  has_many :genres, through: :film_genres
  has_many :topics, through: :film_topics
  has_many :bookings
  has_many :digital_retailer_films
  has_many :digital_retailers, through: :digital_retailer_films
  has_many :sub_rights
  has_many :crossed_films
  has_many :episodes

  after_create :create_percentages

  def create_percentages
    unless film_type == 'Short'
      RevenueStream.all.each do |revenue_stream|
        FilmRevenuePercentage.create!(film_id: id, revenue_stream_id: revenue_stream.id)
      end
    end
  end

  def self.show_end_dates
    result = []
    Film.all.each do |film|
      film.film_rights.each do |film_right|
        unless film_right.end_date
          result << "#{film.title} - #{film_right.right.name} / #{film_right.territory.name}"
        end
      end
    end
    result = result.sort.join("\n")
    p result
    IO.popen("pbcopy", "w") { |pipe| pipe.puts result }
  end

  def self.set_end_dates
    {
      "All About Lily Chou-Chou": "10/30/24",
      "All You Ever Wished For": "6/18/28",
      "Bent": "6/5/25",
      "Farinelli": "9/1/28",
      "Marquise": "9/1/28",
      "Between Two Worlds": "6/13/26",
      "Frantz Fanon: Black Skin, White Mask": "6/13/26",
      "Rafiki": "6/19/33",
      "Styx": "9/30/30",
      "The Days of Abandonment": "5/15/25",
      "The Mad Adventures of 'Rabbi' Jacob": "7/31/26",
      "Waterboys": "2/1/21",
      "The Real American: Joe McCarthy": "1/18/21"
    }.each do |title, end_date|
      film = Film.find_by_title(title)
      film.film_rights.each do |film_right|
        film_right.update!(end_date: end_date)
      end
    end
  end

  def get_sage_id
    sage_id.empty? ? title.upcase : sage_id
  end

  def crossed_film_titles
    ([self.title] + self.crossed_films.map(&:crossed_film).map(&:title)).sort
  end

  def proper_label_name
    case label_id
    when 1
      "Film Movement"
    when 2
      "Omnibus Entertainment"
    when 3
      "Film Movement Classics"
    when 4
      licensor ? licensor.name : ''
    end
  end

  def api_bookings
    all = bookings.where.not(booking_type: ["Non-Theatrical", "Press/WOM"]).includes(:venue)
    result = all.select do |booking|
      if booking.booking_type == 'Festival'
        booking.start_date <= (Date.today + 3.weeks)
      else
        true
      end
    end
    result
  end

end
