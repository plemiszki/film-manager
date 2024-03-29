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

end
