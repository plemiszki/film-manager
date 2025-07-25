class Film < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :title, :label_id, :film_type, presence: true
  validates :title, uniqueness: { scope: :film_type }
  validate :title_valid
  validate :gr_percentage_tenth_decimal
  validates_numericality_of :year, :length
  validates_numericality_of :mg,
    :expense_cap,
    :e_and_o,
    :reserve_quarters,
    :auto_renew_days_notice,
    :auto_renew_term,
    :sell_off_period,
    :rental_price,
    :rental_days,
    :msrp_pre_street,
    :msrp_pre_street_member,
    greater_than_or_equal_to: 0
  validates_numericality_of :reserve_percentage,
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 100
  validates_numericality_of :ppr_pre_street,
    :ppr_pre_street_member,
    :ppr_post_street,
    :ppr_post_street_member,
    :drl_pre_street,
    :drl_pre_street_member,
    :drl_post_street,
    :drl_post_street_member,
    :ppr_drl_pre_street,
    :ppr_drl_pre_street_member,
    :ppr_drl_post_street,
    :ppr_drl_post_street_member,
    greater_than_or_equal_to: 0,
    less_than: 100_000
  validates :start_date,
    :end_date,
    :avod_release,
    :tvod_release,
    :svod_release,
    :fm_plus_release,
    :club_date,
    :theatrical_release,
    :accept_delivery,
    date: { blank_ok: true }
  validates_uniqueness_of :club_date, allow_nil: true
  validate :end_date_not_before_start_date

  def gr_percentage_tenth_decimal
    if [5, 6].include?(deal_type_id)
      validates_numericality_of :gr_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
    end
  end

  def title_valid
    errors.add(:title, 'cannot contain /') if title.present? && title.include?('/')
  end

  def title_amazon_export
    title.split(" ").map { |word| word.capitalize }.join("_").gsub(/\W/, '')
  end

  def xml_mmc_filename_default
    "#{self.title_amazon_export.downcase}_mmc.xml"
  end

  def xml_mec_filename_default
    "#{self.title_amazon_export.downcase}_mec.xml"
  end

  def xml_video_filename_default
    language = self.amazon_languages.first
    language ? "filmmovement-#{title_amazon_export}_Movie-Full-mezz-#{language.code}.mov" : ""
  end

  def xml_trailer_filename_default
    "filmmovement-#{title_amazon_export}_Trailer.mov"
  end

  def xml_subtitles_filename_default
    "filmmovement-FM_#{title_amazon_export}_Subtitle.scc"
  end

  def xml_captions_filename_default
    "filmmovement-FM_#{title_amazon_export}_Caption.scc"
  end

  after_create :create_percentages
  after_save :update_film_rights_end_date_calc

  belongs_to :licensor
  belongs_to :label
  has_many :film_revenue_percentages, dependent: :destroy
  has_many :film_rights, dependent: :destroy
  has_many :royalty_reports, -> { order(:year, :quarter) }, dependent: :destroy
  has_many :dvds, foreign_key: :feature_film_id, dependent: :destroy
  has_many :active_dvds, -> { Dvd.active }, class_name: 'Dvd', foreign_key: :feature_film_id
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
  has_many :edu_platform_films
  has_many :edu_platforms, through: :edu_platform_films
  has_many :sub_rights, dependent: :destroy
  has_many :crossed_films, dependent: :destroy
  has_many :episodes
  has_many :in_theaters_films, dependent: :destroy
  has_many :alternate_lengths, dependent: :destroy
  has_many :alternate_subs, dependent: :destroy
  has_many :alternate_audios, dependent: :destroy
  has_many :virtual_bookings
  has_many :aliases, dependent: :destroy
  has_many :amazon_genre_films, dependent: :destroy
  has_many :amazon_genres, through: :amazon_genre_films
  has_many :amazon_language_films, dependent: :destroy
  has_many :amazon_languages, through: :amazon_language_films
  has_many :dvd_shorts, foreign_key: :short_id, dependent: :destroy

  scope :features, -> { where(film_type: 'Feature') }
  scope :shorts, -> { where(film_type: 'Short') }

  scope :expired, -> { where('end_date <= CURRENT_DATE') }
  scope :not_expired, -> { where('CURRENT_DATE < end_date') }
  scope :days_until_expired, -> (days) { where("end_date > CURRENT_DATE and end_date <= (CURRENT_DATE + #{days})").order(:title) }
  scope :within_auto_renew_window, -> { where("auto_renew = true and auto_renew_opt_out = false and end_date < (CURRENT_DATE + auto_renew_days_notice)") }

  def sent_reminders_within(duration)
    start_date_of_window = self.end_date - duration
    expiration_reminders.select { |sent_date| sent_date >= start_date_of_window }
  end

  # after create
  def create_percentages
    unless film_type == 'Short'
      RevenueStream.all.each do |revenue_stream|
        FilmRevenuePercentage.create!(film_id: id, revenue_stream_id: revenue_stream.id)
      end
    end
  end

  # after save
  def update_film_rights_end_date_calc
    if saved_change_to_auto_renew?
      self.film_rights.each do |film_right|
        film_right.save! # trigger calculate_end_date in before_save hook
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
    all = bookings.where(status: 'Confirmed').where.not(booking_type: ["Non-Theatrical", "Press/WOM"]).includes(:venue)
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
    report
  end

  def auto_renew!
    new_end_date = end_date + auto_renew_term.months
    ActiveRecord::Base.transaction do
      update!(end_date: new_end_date)
      film_rights.each do |film_right|
        film_right.update!(end_date: new_end_date)
      end
    end
  end

  def self.backfill_end_date_calc!
    Film.all.includes(:film_rights).each do |film|
      film.film_rights.each do |film_right|
        film_right.update(end_date_calc: film_right.calculate_end_date)
      end
    end
  end

  def self.send_expiration_reminders!
    six_month_films = Film.get_expiring_films_with_unsent_reminders(days: 180)
    three_month_films = Film.get_expiring_films_with_unsent_reminders(days: 90)
    if six_month_films.present? || three_month_films.present?
      email_body = Film.add_to_email_body(timeframe: 'six', films: six_month_films) if six_month_films.present?
      email_body = Film.add_to_email_body(email_body: email_body || '', timeframe: 'three', films: three_month_films) if three_month_films.present?
      mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      message_params = {
        from: 'michael@filmmovement.com',
        to: (ENV['TEST_MODE'] == 'true' ? ENV['TEST_MODE_EMAIL'] : 'michael@filmmovement.com'),
        subject: "Expiration Reminders",
        text: email_body
      }
      mg_client.send_message 'filmmovement.com', message_params
      six_month_films.each do |film|
        film.expiration_reminders << Date.today
        film.save!
      end
      three_month_films.each do |film|
        film.expiration_reminders << Date.today
        film.save!
      end
    end
  end

  def self.get_expiring_films_with_unsent_reminders(days:)
    Film.days_until_expired(days).select { |film| film.sent_reminders_within(days.days).empty? }
  end

  def self.add_to_email_body(email_body: nil, timeframe:, films:)
    result = email_body || ''
    result += "The following films will expire in #{timeframe} months:\n\n"
    films.each do |film|
      result += "#{film.title} - (#{film.end_date.strftime("%D")})\n"
    end
    result += "\n"
    result
  end

end
