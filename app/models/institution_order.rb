class InstitutionOrder < ActiveRecord::Base

  include DateFieldYearsConverter

  # validations

  before_validation :convert_date_field_years

  validates :institution_id, presence: true
  validates :order_date, date: true
  validates :materials_sent, date: { blank_ok: true }
  validates :number, uniqueness: { scope: :institution_id }
  validates_numericality_of :shipping_fee, :greater_than_or_equal_to => 0

  after_create :add_addresses

  # associations

  belongs_to :institution
  alias_method :customer, :institution

  has_many :institution_order_films
  alias_method :order_films, :institution_order_films
  has_many :films, through: :institution_order_films

  has_one :invoice

  def add_addresses
    institution = Institution.find(institution_id)
    self.billing_name = institution.billing_name
    self.billing_address_1 = institution.billing_address_1
    self.billing_address_2 = institution.billing_address_2
    self.billing_city = institution.billing_city
    self.billing_state = institution.billing_state
    self.billing_zip = institution.billing_zip
    self.billing_country = institution.billing_country
    self.shipping_name = institution.shipping_name
    self.shipping_address_1 = institution.shipping_address_1
    self.shipping_address_2 = institution.shipping_address_2
    self.shipping_city = institution.shipping_city
    self.shipping_state = institution.shipping_state
    self.shipping_zip = institution.shipping_zip
    self.shipping_country = institution.shipping_country
    self.save!
  end

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

  def subtotal
    order_films.reduce(0) { |accum, order_film| accum + order_film.price }
  end

  def total
    subtotal + shipping_fee
  end

  def create_or_update_invoice_rows!
    raise "no invoice found for this order" if invoice.nil?
    invoice.rows.destroy_all
    order_films.each do |order_film|
      label = "#{order_film.film.title} - #{order_film.licensed_rights_display_text}"
      label += " (#{order_film.formats})" unless order_film.formats.empty?
      InvoiceRow.create!(
        invoice: invoice,
        item_label: label,
        item_qty: 1,
        total_price: order_film.price,
        item_id: order_film.film.id,
      )
    end
    if shipping_fee > 0
      InvoiceRow.create!(
        invoice: invoice,
        item_label: "Shipping Fee",
        item_qty: 1,
        total_price: shipping_fee,
      )
    end
  end

end
