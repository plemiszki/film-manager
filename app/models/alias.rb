class Alias < ActiveRecord::Base

  validates :text, :film_id, presence: true
  validates :text, uniqueness: { scope: :film_id }

  belongs_to :film

end
