class AmazonLanguage < ActiveRecord::Base

  validates :name, :code, presence: true

end
