class Film < ActiveRecord::Base

  validates :title, :label_id, :film_type, presence: true
  validates :title, uniqueness: { scope: :film_type }
  validate :title_valid
  validate :gr_percentage_tenth_decimal
  validates_numericality_of :year, :length
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :expense_cap, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :reserve_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates_numericality_of :reserve_quarters, :greater_than_or_equal_to => 0
  validates_numericality_of :auto_renew_term, :greater_than_or_equal_to => 0
  validates_numericality_of :auto_renew_days_notice, :greater_than_or_equal_to => 0
  validates_numericality_of :sell_off_period, :greater_than_or_equal_to => 0
  validates_date :start_date, :end_date, :avod_release, :tvod_release, :svod_release, :club_date, :theatrical_release, :accept_delivery, allow_blank: true
  validates_uniqueness_of :club_date, allow_nil: true
  validates_numericality_of :rental_price, :greater_than_or_equal_to => 0
  validates_numericality_of :rental_days, :greater_than_or_equal_to => 0

  def gr_percentage_tenth_decimal
    if [5, 6].include?(deal_type_id)
      validates_numericality_of :gr_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
    end
  end

  def title_valid
    errors.add(:title, 'cannot contain /') if title.include?('/')
  end

  after_create :create_percentages

  belongs_to :licensor
  belongs_to :label
  has_many :film_revenue_percentages, dependent: :destroy
  has_many :film_rights, dependent: :destroy
  has_many :royalty_reports, dependent: :destroy
  has_many :dvds, foreign_key: :feature_film_id, dependent: :destroy
  has_many :quotes, dependent: :destroy
  has_many :laurels, dependent: :destroy
  has_many :related_films, dependent: :destroy
  has_many :directors, -> { order(:order) }, dependent: :destroy
  has_many :actors, as: :actorable, dependent: :destroy
  has_many :film_countries, -> { order(:order) }, dependent: :destroy
  has_many :film_languages, -> { order(:order) }, dependent: :destroy
  has_many :film_genres, -> { order(:order) }, dependent: :destroy
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
  has_many :sub_rights, dependent: :destroy
  has_many :crossed_films
  has_many :episodes
  has_many :in_theaters_films, dependent: :destroy
  has_many :alternate_lengths, dependent: :destroy
  has_many :alternate_subs, dependent: :destroy
  has_many :alternate_audios, dependent: :destroy
  has_many :virtual_bookings
  has_many :aliases, dependent: :destroy

  scope :features, -> { where(film_type: 'Feature') }
  scope :shorts, -> { where(film_type: 'Short') }

  def create_percentages
    unless film_type == 'Short'
      RevenueStream.all.each do |revenue_stream|
        FilmRevenuePercentage.create!(film_id: id, revenue_stream_id: revenue_stream.id)
      end
    end
  end

  def has_crossed_films?
    crossed_films.length > 0
  end

  def get_sage_id
    sage_id.empty? ? (self.film_type == 'Short' ? 'SHORTS' : title.upcase) : sage_id
  end

  def self.find_from_sage_id(sage_id)
    film = Film.find_by_sage_id(sage_id)
    film = Film.where('upper(title) = ?', sage_id).first unless film
    film
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
    all = bookings.where.not(status: 'Cancelled', booking_type: ["Non-Theatrical", "Press/WOM"]).includes(:venue)
    result = all.select do |booking|
      if booking.booking_type == 'Festival'
        booking.start_date <= (Date.today + 3.weeks)
      else
        true
      end
    end
    result
  end

  def fix_duplicate_quote_order_values!
    quotes.order(:order).each_with_index do |quote, index|
      quote.update!(order: index)
    end
  end

  def create_royalty_statement!(quarter, year)
    raise 'ignore sage id' if ignore_sage_id
    raise 'report exists!' if RoyaltyReport.find_by_film_id_and_quarter_and_year(id, quarter, year)
    report = RoyaltyReport.create!(film_id: id, deal_id: deal_type_id, quarter: quarter, year: year, mg: mg, e_and_o: e_and_o)
    report.create_empty_streams!
    report.transfer_and_calculate_from_previous_report!
  end

  def self.backfill_end_date_calc!
    Film.all.includes(:film_rights).each do |film|
      film.film_rights.each do |film_right|
        film_right.update(end_date_calc: film.auto_renew ? (film_right.end_date + film.auto_renew_term.months) : film_right.end_date)
      end
    end
  end

end
