class AlternateLength < ActiveRecord::Base

  validates :film_id, :length, presence: true
  validates :length, uniqueness: { scope: :film_id }

  belongs_to :film

end
