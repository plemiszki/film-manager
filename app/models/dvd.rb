class Dvd < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :dvd_type_id, presence: true
  validates :feature_film_id, presence: true
  validates_numericality_of :price, :greater_than_or_equal_to => 0
  validates_numericality_of :discs, :greater_than_or_equal_to => 1
  validates :dvd_type_id, uniqueness: { scope: :feature_film_id }
  validates :pre_book_date, :retail_date, date: { blank_ok: true }

  belongs_to :dvd_type
  belongs_to(
    :feature,
    class_name: "Film",
    foreign_key: :feature_film_id,
    primary_key: :id
  )

  has_many :dvd_shorts
  has_many :giftbox_dvds, dependent: :destroy

  has_many(
    :shorts,
    through: :dvd_shorts
  )

  def render_json
    self.as_json.deep_transform_keys { |k| k.to_s.camelize(:lower) }
  end

end
