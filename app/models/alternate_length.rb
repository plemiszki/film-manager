class AlternateLength < ActiveRecord::Base

  validates :film_id, :length, presence: true
  validates :length, uniqueness: { scope: :film_id }
  validates_numericality_of :length, :greater_than => 0

  belongs_to :film

end
