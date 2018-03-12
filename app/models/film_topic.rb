class FilmTopic < ActiveRecord::Base

  validates :film_id, :topic_id, presence: true

  belongs_to :topic
  belongs_to :film

end
