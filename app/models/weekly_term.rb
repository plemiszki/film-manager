class WeeklyTerm < ActiveRecord::Base

  validates :booking_id, :terms, :order, presence: true

  belongs_to :booking

end
