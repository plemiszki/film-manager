class Return < ActiveRecord::Base

  validates :number, :date, :customer_id, presence: true
  validates_date :date, allow_blank: false

  has_many :return_items, -> { order(:order) }, dependent: :destroy
  has_many :items, through: :return_items
  belongs_to :customer, class_name: "DvdCustomer", foreign_key: :customer_id
  belongs_to :credit_memo, primary_key: :return_number, foreign_key: :number

  def generate_credit_memo!
    fail 'credit memo exists!' if credit_memo.present?
    new_credit_memo = nil
    ActiveRecord::Base.transaction do
      new_credit_memo = CreditMemo.create!(
        number: "CM#{Setting.first.next_credit_memo_number}",
        return_number: number,
        sent_date: Date.today,
        customer_id: customer_id,
        billing_name: customer.billing_name,
        billing_address1: customer.address1,
        billing_address2: customer.address2,
        billing_city: customer.city,
        billing_state: customer.state,
        billing_zip: customer.zip,
        billing_country: customer.country
      )
      total = 0
      return_items.each do |return_item|
        dvd = return_item.dvd
        price = Invoice.get_item_price(dvd.id, 'dvd', customer).to_f
        total += (price * return_item.qty)
        film = dvd.feature
        CreditMemoRow.create!(
          credit_memo_id: new_credit_memo.id,
          dvd_id: return_item.item_id,
          item_label: (film.title + (['Retail', 'Club'].include?(dvd.dvd_type.name) ? '' : " (#{dvd.dvd_type.name})")),
          unit_price: price,
          item_qty: return_item.qty,
          total_price: price * return_item.qty
        )
        new_credit_memo.update!(total: total)
      end
    end
    Setting.increment_credit_memo_number!
    new_credit_memo
  end

end
