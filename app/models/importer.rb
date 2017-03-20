class Importer < ActiveRecord::Base

  def self.import_licensors
    DatabaseCleaner.clean_with(:truncation, :except => %w[users] )
    File.open(Rails.root.join('data/Admin.txt')) do |f|
      array = f.gets.split('^')
      total = array[0].to_i
      array.shift
      licensors = 0
      until licensors == total
        l = Licensor.new(name: array[1], address: "#{array[2]}\n#{array[3]}\n#{array[4]}")
        l.save!
        array.shift(5)
        licensors += 1
      end
    end
  end

end
