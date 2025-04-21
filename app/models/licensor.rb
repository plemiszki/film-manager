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

  def self.export_sage_id_csv
    CSV.open("licensor_sage_ids.csv", "w") do |csv|
      csv << ["ID", "Name", "Sage ID"]
      all.order(:id).each do |licensor|
        csv << [licensor.id, licensor.name, licensor.sage_id]
      end
    end
  end

  def self.import_sage_ids!
    data = CSV.read("data_files/licensor_sage_ids.csv")
    data[1..-1].each do |row|
      id, sage_id = row
      licensor = Licensor.find(id)
      if sage_id.present?
        licensor.update!(sage_id: sage_id)
      end
    end
  end

  def most_recent_statements
    most_recent_report = RoyaltyReport.joins(:film).where(film: { licensor_id: id }).order(year: :desc).order(quarter: :desc).first
    most_recent_year = most_recent_report.year
    most_recent_quarter = most_recent_report.quarter
    RoyaltyReport.joins(:film).where(film: { licensor_id: id }, quarter: most_recent_quarter, year: most_recent_year)
  end

  def licensor_share_constant_across_all_revenue_streams?
    films.map { |film| film.film_revenue_percentages.pluck(:value).reject { |value| value.zero? } }.flatten.uniq.length == 1
  end

end
