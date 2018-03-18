class Actor < ActiveRecord::Base

  validates :film_id, :last_name, presence: true

  belongs_to :film

end
