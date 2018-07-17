class SubRight < ActiveRecord::Base

  validates :sublicensor_id, :right_id, :territory_id, presence: true
  validates :sublicensor_id, uniqueness: { scope: [:right_id, :territory_id] }
  validates_date :start_date, :end_date, allow_blank: false

  belongs_to :sublicensor
  belongs_to :right
  belongs_to :territory

end
