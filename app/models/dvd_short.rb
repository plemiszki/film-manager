class DvdShort < ActiveRecord::Base

  validates :dvd_id, :short_id, presence: true
  validates :dvd_id, uniqueness: { scope: :short_id }

  has_many(
    :shorts,
    class_name: "Film",
    foreign_key: :id,
    primary_key: :short_id
  )

end
