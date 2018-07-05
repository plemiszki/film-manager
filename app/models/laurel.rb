class Laurel < ActiveRecord::Base

  validates :film_id, :result, :festival, presence: true

  belongs_to :film

  def string
    "#{result} #{award_name ? "- #{award_name} " : '' }- #{festival}"
  end

end
