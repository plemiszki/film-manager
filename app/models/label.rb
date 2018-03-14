class Label < ActiveRecord::Base

  validates :name, presence: true

  has_many :films

end
