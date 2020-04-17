class FilmRight < ActiveRecord::Base

  validates :film_id, :right_id, :territory_id, presence: true
  validates :film_id, uniqueness: { scope: [:right_id, :territory_id] }
  validates_date :start_date, :end_date, allow_blank: true
  validate :end_date_after_start_date

  def end_date_after_start_date
    return unless start_date && end_date
    if start_date.presence >= end_date
      errors.add(:start_date, "can't be after end date")
    end
  end

  belongs_to :film
  belongs_to :right
  belongs_to :territory

end
