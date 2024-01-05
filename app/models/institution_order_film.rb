class InstitutionOrderFilm < ActiveRecord::Base

  validates :film_id, :institution_order_id, presence: true
  validates :film_id, uniqueness: { scope: :institution_order_id }

  belongs_to :film

  belongs_to :institution_order
  alias_attribute :order, :institution_order

end
