class InstitutionOrderFilm < ActiveRecord::Base

  enum(:licensed_rights, [:disc_only, :ppr, :drl, :ppr_and_drl])

  validates :film_id, :institution_order_id, presence: true
  validates :film_id, uniqueness: { scope: :institution_order_id }
  validates_numericality_of :price, :greater_than_or_equal_to => 0

  belongs_to :film

  belongs_to :institution_order
  alias_method :order, :institution_order

  def licensed_rights_display_text
    case licensed_rights
    when "disc_only"
      licensed_rights.titleize
    when "ppr_and_drl"
      "PPR and DRL"
    else
      licensed_rights.upcase
    end
  end

end
