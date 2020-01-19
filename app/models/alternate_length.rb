class AlternateLength < ActiveRecord::Base

  validates :film_id, :length, presence: true
  validates_numericality_of :length, :greater_than => 0
  validates :length, uniqueness: { scope: :film_id }

  belongs_to :film

end
