class Importer < ActiveRecord::Base

  def self.import_licensors
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

  def self.import_films
    File.open(Rails.root.join('data/Films.txt')) do |file|
      total = file.gets.to_i
      films = 0
      until films == total
        a = file.gets.split("\t")
        f = Film.new(title: a[1], label_id: 0, days_statement_due: 30, short_film: a[54] == "short")
        f.save!
        films += 1
      end
    end
  end

end
