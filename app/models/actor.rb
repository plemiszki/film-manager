class Actor < ActiveRecord::Base

  validates :actorable_id, :last_name, presence: true

  belongs_to :actorable, polymorphic: true

  def string
    "#{first_name} #{last_name}"
  end

end
