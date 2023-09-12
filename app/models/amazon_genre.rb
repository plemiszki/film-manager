class AmazonGenre < ActiveRecord::Base

  validates :code, presence: true

  def self.import!
    table = CSV.parse(File.read(Rails.root.join("./amazon_genres.csv").to_s))
    table.each do |row|
      code = row[0]
      self.create!(code: code)
    end
  end

end
