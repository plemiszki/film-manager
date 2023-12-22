class Institution < ActiveRecord::Base

  validates :label, presence: true
  validates :label, uniqueness: true

end
