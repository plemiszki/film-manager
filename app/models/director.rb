class Director < ActiveRecord::Base

  validates :film_id, :last_name, presence: true

  belongs_to :film

  def string
    "#{first_name} #{last_name}"
  end

end
