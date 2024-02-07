class Actor < ActiveRecord::Base

  validates :actorable_id, :last_name, presence: true

  belongs_to :actorable, polymorphic: true, touch: true

  def full_name
    "#{first_name} #{last_name}"
  end

end
