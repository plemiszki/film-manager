class Film < ActiveRecord::Base

  validates :title, :label_id, presence: true
  validates :title, uniqueness: { scope: :short_film }
  validate :gr_percentage_tenth_decimal
  validates_numericality_of :year, :length
  validates_numericality_of :mg, :greater_than_or_equal_to => 0
  validates_numericality_of :expense_cap, :greater_than_or_equal_to => 0
  validates_numericality_of :e_and_o, :greater_than_or_equal_to => 0
  validates_numericality_of :reserve_percentage, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100
  validates_numericality_of :reserve_quarters, :greater_than_or_equal_to => 0
  validates_numericality_of :auto_renew_term, :greater_than_or_equal_to => 0
  validates_numericality_of :sell_off_period, :greater_than_or_equal_to => 0
  validates_date :club_date, allow_blank: true
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
  has_many :actors, dependent: :destroy
  has_many :film_countries, dependent: :destroy
  has_many :film_languages, dependent: :destroy
  has_many :film_genres, dependent: :destroy
  has_many :film_topics, dependent: :destroy
  has_many :countries, through: :film_countries
  has_many :languages, through: :film_languages
  has_many :genres, through: :film_genres
  has_many :topics, through: :film_topics

  after_create :create_percentages

  def create_percentages
    unless short_film
      RevenueStream.all.each do |revenue_stream|
        FilmRevenuePercentage.create!(film_id: id, revenue_stream_id: revenue_stream.id)
      end
    end
  end

  def get_sage_id
    sage_id.empty? ? title.upcase : sage_id
  end

  def self.vimeo_export
    require 'xlsx_writer'
    doc = XlsxWriter.new
    sheet = doc.add_sheet("Films")
    sheet.add_row([
      "Start Date",
      "End Date",
      "Film",
      "Venue",
      "Type",
      "Status",
      "Terms",
      "Format",
      "Advance",
      "Shipping Fee",
      "Screenings",
      "Premiere",
      "Booker",
      "Billing Name",
      "Billing Address 1",
      "Billing Address 2",
      "Billing City",
      "Billing State",
      "Billing Zip",
      "Billing Country",
      "Shipping Name",
      "Shipping Address 1",
      "Shipping Address 2",
      "Shipping City",
      "Shipping State",
      "Shipping Zip",
      "Shipping Country",
      "Email",
      "Materials Sent",
      "Tracking Number",
      "Shipping Notes",
      "Delivered",
      "Box Office Received",
      "Box Office"
    ])

    films = Film.all

    films.each do |film|
      sheet.add_row([
        film.title
      ])
    end

    file_path = "#{Rails.root}/films.xlsx"
    FileUtils.mv doc.path, file_path
    doc.cleanup
  end

end
