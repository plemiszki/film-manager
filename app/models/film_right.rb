class FilmRight < ActiveRecord::Base

  include DateFieldYearsConverter
  before_validation :convert_date_field_years

  validates :film_id, :right_id, :territory_id, presence: true
  validates :right_id, uniqueness: { scope: [:film_id, :territory_id] }
  validates :start_date, :end_date, :end_date_calc, date: { blank_ok: true }
  validate :end_date_after_start_date

  def end_date_after_start_date
    return unless start_date && end_date
    if start_date.presence >= end_date
      errors.add(:start_date, "can't be after end date")
    end
  end

  before_save :calculate_end_date

  belongs_to :film
  belongs_to :right
  belongs_to :territory

  def calculate_end_date
    self.end_date_calc = film.auto_renew ? (self.end_date + film.auto_renew_term.months) : self.end_date
  end

end
