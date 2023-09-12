class AmazonGenre < ActiveRecord::Base

  validates :code, presence: true

  has_many :amazon_genre_films, dependent: :destroy

  def self.import!
    table = CSV.parse(File.read(Rails.root.join("./amazon_genres.csv").to_s))
    table.each do |row|
      code = row[0]
      self.create!(code: code)
    end
  end

end
