class Laurel < ActiveRecord::Base

  validates :film_id, :result, :festival, presence: true

  belongs_to :film, touch: true

  def string
    "#{result} #{!award_name.empty? ? "- #{award_name} " : '' }- #{festival}"
  end

end
