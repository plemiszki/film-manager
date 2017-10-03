class Giftbox < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true
  validates :upc, presence: true, uniqueness: true
  validates_numericality_of :msrp, :greater_than_or_equal_to => 0

  has_many :giftbox_dvds
  has_many :dvds, through: :giftbox_dvds

end
