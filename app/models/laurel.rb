class Laurel < ActiveRecord::Base

  validates :film_id, :result, :festival, presence: true

  belongs_to :film

end
