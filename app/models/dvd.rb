class Dvd < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :dvd_type_id, presence: true
  validates :feature_film_id, presence: true
  validates_numericality_of :price, :greater_than_or_equal_to => 0
  validates_numericality_of :discs, :greater_than_or_equal_to => 1
  validates :pre_book_date, :retail_date, :first_shipment, date: { blank_ok: true }

  belongs_to :dvd_type
  belongs_to(
    :feature,
    class_name: "Film",
    foreign_key: :feature_film_id,
    primary_key: :id,
    touch: true,
  )

  has_many :dvd_shorts
  has_many :giftbox_dvds, dependent: :destroy

  has_many(
    :shorts,
    through: :dvd_shorts
  )

  scope :active, -> { where(active: true) }

  def render_json
    self.as_json.deep_transform_keys { |k| k.to_s.camelize(:lower) }
  end

  def self.update_pricing!
    require 'csv'
    problems = []
    table = CSV.parse(File.read(Rails.root.join("./pricing.csv").to_s), headers: true)
    table.each do |row|
      dvd_upc = row["Retail DVD UPC"]
      dvd_price = row["NEW DVD PRICE"]
      bd_upc = row["Blu-ray UPC"]
      bd_price = row["NEW BLU RAY PRICE"]
      if dvd_upc.present? && dvd_upc != "n/a"
        dvd = Dvd.find_by_upc(dvd_upc)
        problems << row["Title"] unless dvd
        dvd.update!(price: dvd_price.sub("$", ""))
      end
      if bd_upc.present? && bd_upc != "n/a"
        bd = Dvd.find_by_upc(bd_upc)
        problems << row["Title"] unless bd
        bd.update!(price: bd_price.sub("$", ""))
      end
    end
    problems
  end

end
