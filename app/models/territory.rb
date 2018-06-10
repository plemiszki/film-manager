class Territory < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :film_rights, dependent: :destroy

end
