class AmazonGenre < ActiveRecord::Base

  validates :name, presence: true

end
