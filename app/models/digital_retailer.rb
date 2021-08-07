class DigitalRetailer < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :digital_retailer_films, dependent: :destroy

end
