class Booker < ActiveRecord::Base

  validates :name, presence: true

  has_many :booker_venues
  has_many :venues, through: :booker_venues

end
