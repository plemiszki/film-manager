class Right < ActiveRecord::Base

  validates :name, :order, presence: true

  has_many :film_rights, dependent: :destroy

end
