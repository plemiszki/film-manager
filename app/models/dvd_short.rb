class DvdShort < ActiveRecord::Base

  validates :dvd_id, :short_id, presence: true
  validates :dvd_id, uniqueness: { scope: :short_id }

  belongs_to :dvd, touch: true
  belongs_to :film, foreign_key: :short_id, touch: true

  has_many(
    :shorts,
    class_name: "Film",
    foreign_key: :id,
    primary_key: :short_id
  )

end
