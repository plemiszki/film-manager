class Sublicensor < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :sub_rights, dependent: :destroy

end
