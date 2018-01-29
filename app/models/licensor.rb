class Licensor < ActiveRecord::Base

  validates :name, presence: true
  validates :name, uniqueness: true

  has_many :films

  def units_by_quarter(year, quarter)
    result = {}
    self.films.each do |film|
      result[film.title] = {}
      film.dvds.each do |dvd|
        result[film.title][dvd.dvd_type.name] = {}
        result[film.title][dvd.dvd_type.name][:sold] = 0
        result[film.title][dvd.dvd_type.name][:returned] = 0
        PurchaseOrder.all.where(year: year, month: [10, 11, 12]).includes(:purchase_order_items).select { |po| po.ship_date }.each do |po|
          result[film.title][dvd.dvd_type.name][:sold] += (po.purchase_order_items.select { |row| row.item_type == "dvd" && row.item_id == dvd.id }.map { |row| row.qty }.inject(:+) || 0)
        end
        Return.all.where(year: year, month: [10, 11, 12]).includes(:return_items).each do |r|
          result[film.title][dvd.dvd_type.name][:returned] += (r.return_items.select { |row| row.item_type == "dvd" && row.item_id == dvd.id }.map { |row| row.qty }.inject(:+) || 0)
        end
      end
    end
    result
  end

end
