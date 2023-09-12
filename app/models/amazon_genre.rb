class AmazonGenre < ActiveRecord::Base

  validates :name, :code, presence: true

  def self.import!
    table = CSV.parse(File.read(Rails.root.join("./amazon_genres.csv").to_s))
    table.each do |row|
      name = row[0]
      self.create!(name: name)
    end
  end

end
