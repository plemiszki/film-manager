class AlternateLength < ActiveRecord::Base

  validates :film_id, :length, presence: true
  validates :film_id, uniqueness: { scope: :length }

  belongs_to :film

end
