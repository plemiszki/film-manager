class MerchandiseType < ActiveRecord::Base

  validates :name, presence: true

end
