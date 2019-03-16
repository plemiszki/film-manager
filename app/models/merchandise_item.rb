class MerchandiseItem < ActiveRecord::Base

  validates :merchandise_type_id, :name, presence: true
  validates_numericality_of :inventory
  validates_numericality_of :price, :greater_than_or_equal_to => 0

  belongs_to :merchandise_type

end
