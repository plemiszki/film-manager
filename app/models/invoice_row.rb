class InvoiceRow < ActiveRecord::Base

  validates :invoice_id, :item_label, :item_qty, presence: true

  belongs_to :invoice

  def item_label_first_line
    if item_label.include?("\n")
      "#{item_label.split("\n").first}, ...(more)"
    else
      item_label
    end
  end

  def unit_price_cents
    self.unit_price.*(100).to_i
  end

  def total_price_cents
    self.total_price.*(100).to_i
  end

end
