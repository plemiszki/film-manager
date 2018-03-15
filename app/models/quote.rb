class Quote < ActiveRecord::Base

  validates :film_id, :text, presence: true

  belongs_to :film

end
