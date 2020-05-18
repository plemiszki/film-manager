class Quote < ActiveRecord::Base

  validates :film_id, :text, presence: true

  belongs_to :film

  def self.detect_duplicate_order_values
    result = []
    Film.includes(:quotes).each do |film|
      order_values = film.quotes.map { |quote| quote.order }
      result << film.id if order_values.length != order_values.uniq.length
    end
    result
  end

  def self.fix_all_duplicate_order_values!
    detect_duplicate_order_values.each do |film_id|
      Film.find(film_id).fix_duplicate_quote_order_values!
    end
  end

end
