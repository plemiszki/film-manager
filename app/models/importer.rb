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
        f = Film.new(
          title: a[1],
          short_film: a[54] == "short",
          label_id: 0,
          deal_type_id: a[241] == "Template A" ? 1 : (a[241] == "Template B" ? 2 : (a[241] == "Template B (Theat. Only)" ? 3 : (a[241] == "Template C" ? 4 : (a[241] == "Template D" ? 5 : (a[241] == "Template E" ? 6 : nil))))),
          days_statement_due: a[357],
          gr_percentage: a[326],
          mg: a[11],
          e_and_o: a[242],
          expense_cap: a[358],
          sage_id: a[276],
          royalty_notes: a[337]
        )
        # licensor id
        # feature id
        f.save!
        films += 1
      end
    end
  end

end
