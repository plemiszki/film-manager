class AmazonLanguage < ActiveRecord::Base

  validates :name, :code, presence: true

  has_many :amazon_language_films, dependent: :destroy

  def self.import!
    table = CSV.parse(File.read(Rails.root.join("./amazon_languages.csv").to_s))
    table.each do |row|
      code = row[0]
      name = row[1]
      self.create!(code: code, name: name)
    end
  end

end
