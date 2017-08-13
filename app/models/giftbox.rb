class Giftbox < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true
  validates :upc, presence: true, uniqueness: true

end
