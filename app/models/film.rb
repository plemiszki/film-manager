class Film < ActiveRecord::Base

  validates :title, :label_id, :days_statement_due, presence: true

end
