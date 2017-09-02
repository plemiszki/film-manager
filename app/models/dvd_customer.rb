class DvdCustomer < ActiveRecord::Base

  validates :name, presence: true
  validates_numericality_of :discount, :greater_than_or_equal_to => 0, :less_than_or_equal_to => 100

end
