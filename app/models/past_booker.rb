class PastBooker < ActiveRecord::Base

  validates :name, presence: true

end
