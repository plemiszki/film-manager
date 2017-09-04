class Dvd < ActiveRecord::Base

  validates :dvd_type_id, presence: true
  validates :feature_film_id, presence: true
  validates_numericality_of :price, :greater_than_or_equal_to => 0
  validates_numericality_of :discs, :greater_than_or_equal_to => 1, :less_than_or_equal_to => 2
  validates :dvd_type_id, uniqueness: { scope: :feature_film_id }

  belongs_to :dvd_type
  belongs_to(
    :feature,
    class_name: "Film",
    foreign_key: :feature_film_id,
    primary_key: :id
  )

  def shorts
    Film.where(id: [short_film_id, short_film_2_id])
  end

end
