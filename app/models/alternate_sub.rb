class AlternateSub < ActiveRecord::Base

  validates :language_id, :film_id, presence: true
  validates :language_id, uniqueness: { scope: :film_id }

  belongs_to :language
  belongs_to :film

end
