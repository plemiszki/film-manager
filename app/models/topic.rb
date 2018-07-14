class Topic < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :film_topics, dependent: :destroy

end
